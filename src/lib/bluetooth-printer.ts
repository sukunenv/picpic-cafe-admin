export interface ReceiptData {
  order_number: string;
  customer_name: string;
  table_number: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  subtotal?: number;
  discount?: number;
  method: string;
  change: number;
  date: string;
}

const FALLBACK_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb';
const FALLBACK_CHAR = '00002af1-0000-1000-8000-00805f9b34fb';

let bluetoothDevice: BluetoothDevice | null = null;
let printCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

const getSettings = () => {
  let printer = { serviceUUID: FALLBACK_SERVICE, characteristicUUID: FALLBACK_CHAR, paperSize: '58mm' };
  let cafe = { name: 'PICPIC CAFE', description: 'kumpul mencerita', address: '', phone: '' };

  try {
    const sp = JSON.parse(localStorage.getItem('settings_printer') || '{}');
    if (sp.serviceUUID) printer.serviceUUID = sp.serviceUUID;
    if (sp.characteristicUUID) printer.characteristicUUID = sp.characteristicUUID;
    if (sp.paperSize) printer.paperSize = sp.paperSize;
  } catch {}

  try {
    const sc = JSON.parse(localStorage.getItem('settings_cafe') || '{}');
    if (sc.name) cafe.name = sc.name;
    if (sc.description) cafe.description = sc.description;
    if (sc.address) cafe.address = sc.address;
    if (sc.phone) cafe.phone = sc.phone;
  } catch {}

  return { printer, cafe };
};

export const connectPrinter = async (): Promise<BluetoothRemoteGATTCharacteristic> => {
  if (!navigator.bluetooth) {
    throw new Error('Bluetooth tidak didukung browser ini. Gunakan Chrome.');
  }

  const { printer } = getSettings();
  
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [printer.serviceUUID] },
        { services: [FALLBACK_SERVICE] },
        { namePrefix: 'Printer' },
        { namePrefix: 'MPT' }
      ],
      optionalServices: [printer.serviceUUID, FALLBACK_SERVICE]
    });

    const server = await bluetoothDevice.gatt?.connect();
    
    // Try Settings Service
    try {
      const service = await server?.getPrimaryService(printer.serviceUUID);
      printCharacteristic = await service?.getCharacteristic(printer.characteristicUUID) || null;
    } catch {
      // Try Fallback Service
      const service = await server?.getPrimaryService(FALLBACK_SERVICE);
      printCharacteristic = await service?.getCharacteristic(FALLBACK_CHAR) || null;
    }

    if (!printCharacteristic) {
      throw new Error('Karakteristik printer tidak ditemukan.');
    }

    return printCharacteristic;
  } catch (error: any) {
    console.error('Bluetooth connection failed:', error);
    throw new Error(error.message || 'Printer tidak ditemukan.');
  }
};

export const printReceipt = async (data: ReceiptData) => {
  if (!printCharacteristic) {
    await connectPrinter();
  }

  if (!printCharacteristic) throw new Error('Cannot connect to printer.');

  const { printer, cafe } = getSettings();
  const width = printer.paperSize === '80mm' ? 48 : 32;
  
  const encoder = new TextEncoder();
  
  const COMMANDS = {
    INIT: new Uint8Array([0x1B, 0x40]),
    CENTER: new Uint8Array([0x1B, 0x61, 0x01]),
    LEFT: new Uint8Array([0x1B, 0x61, 0x00]),
    BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]),
    BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]),
    LINE_FEED: new Uint8Array([0x0A]),
    CUT: new Uint8Array([0x1D, 0x56, 0x41, 0x10]),
  };

  const send = async (bytes: Uint8Array) => {
    await printCharacteristic?.writeValue(bytes);
  };

  const separator = '='.repeat(width) + '\n';
  const lineSeparator = '-'.repeat(width) + '\n';

  // Start Printing
  await send(COMMANDS.INIT);
  await send(COMMANDS.CENTER);
  await send(encoder.encode(separator));
  
  await send(COMMANDS.BOLD_ON);
  await send(encoder.encode(`${cafe.name.toUpperCase()}\n`));
  await send(COMMANDS.BOLD_OFF);
  
  if (cafe.description) await send(encoder.encode(`${cafe.description}\n`));
  if (cafe.address) await send(encoder.encode(`${cafe.address}\n`));
  if (cafe.phone) await send(encoder.encode(`${cafe.phone}\n`));
  
  await send(encoder.encode(separator));

  await send(COMMANDS.LEFT);
  await send(encoder.encode(`Tgl: ${data.date}\n`));
  await send(encoder.encode(`No : ${data.order_number}\n`));
  await send(encoder.encode(`Customer: ${data.customer_name}\n`));
  await send(encoder.encode(`Meja: ${data.table_number || '-'}\n`));
  await send(encoder.encode(lineSeparator));

  for (const item of data.items) {
    const itemName = item.name.length > width ? item.name.substring(0, width) : item.name;
    await send(encoder.encode(`${itemName}\n`));
    
    // Format: "2 x 15.000            30.000"
    const qtyPrice = `${item.quantity} x ${item.price.toLocaleString('id-ID')}`;
    const totalItem = (item.quantity * item.price).toLocaleString('id-ID');
    
    const spaces = width - qtyPrice.length - totalItem.length;
    if (spaces > 0) {
      await send(encoder.encode(`${qtyPrice}${' '.repeat(spaces)}${totalItem}\n`));
    } else {
      await send(encoder.encode(`${qtyPrice}   ${totalItem}\n`));
    }
  }
  
  await send(encoder.encode(lineSeparator));
  
  if (data.discount && data.discount > 0) {
    const sLabel = "Subtotal: ";
    const sVal = (data.subtotal || 0).toLocaleString('id-ID');
    const sSpaces = width - sLabel.length - sVal.length;
    await send(encoder.encode(`${sLabel}${' '.repeat(sSpaces > 0 ? sSpaces : 1)}${sVal}\n`));

    const dLabel = "Disc SO 25%: ";
    const dVal = `-Rp ${data.discount.toLocaleString('id-ID')}`;
    const dSpaces = width - dLabel.length - dVal.length;
    await send(encoder.encode(`${dLabel}${' '.repeat(dSpaces > 0 ? dSpaces : 1)}${dVal}\n`));
    await send(encoder.encode(lineSeparator));
  }

  await send(COMMANDS.BOLD_ON);
  const tLabel = "TOTAL: ";
  const tVal = `Rp ${data.total.toLocaleString('id-ID')}`;
  const tSpaces = width - tLabel.length - tVal.length;
  await send(encoder.encode(`${tLabel}${' '.repeat(tSpaces > 0 ? tSpaces : 1)}${tVal}\n`));
  await send(COMMANDS.BOLD_OFF);
  
  const bLabel = "Bayar: ";
  const bVal = data.method.toUpperCase();
  const bSpaces = width - bLabel.length - bVal.length;
  await send(encoder.encode(`${bLabel}${' '.repeat(bSpaces > 0 ? bSpaces : 1)}${bVal}\n`));

  if (data.method.toLowerCase() === 'cash' || data.change > 0) {
    const cLabel = "Kembali: ";
    const cVal = `Rp ${data.change.toLocaleString('id-ID')}`;
    const cSpaces = width - cLabel.length - cVal.length;
    await send(encoder.encode(`${cLabel}${' '.repeat(cSpaces > 0 ? cSpaces : 1)}${cVal}\n`));
  }

  await send(encoder.encode(separator));
  await send(COMMANDS.CENTER);
  await send(encoder.encode("Terima kasih!\n"));
  await send(encoder.encode(separator));

  // Finish
  await send(COMMANDS.LINE_FEED);
  await send(COMMANDS.LINE_FEED);
  await send(COMMANDS.LINE_FEED);
  await send(COMMANDS.CUT);
};
