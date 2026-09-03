import { Resident, Payment, SystemSettings } from '../types';

export const OFFICIAL_WHATSAPP_GATEWAY = '8882997700';
export const OFFICIAL_WHATSAPP_DISPLAY = '+91 8882997700';

/**
 * Cleans phone number to international format (defaulting to India country code +91)
 */
export function cleanWhatsAppPhone(phone: string): string {
  if (!phone) return '918882997700';
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // If 10-digit standard Indian mobile number, prefix 91
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already in 91XXXXXXXXXX format
  }
  
  return cleaned || '918882997700';
}

export interface WhatsAppMessagePayload {
  type: 'PAYMENT_REMINDER' | 'PAYMENT_CONFIRMATION' | 'KYC_REQUEST' | 'COMPLAINT_UPDATE' | 'GENERAL_ANNOUNCEMENT' | 'CUSTOM';
  resident: Resident;
  payment?: Payment | null;
  settings?: SystemSettings | null;
  month?: string;
  customText?: string;
  balance?: number;
  complaintTitle?: string;
  complaintStatus?: string;
  complaintResolution?: string;
}

/**
 * Generates formatted WhatsApp markdown text with emojis and property details
 */
export function buildWhatsAppMessage(payload: WhatsAppMessagePayload): string {
  const {
    type,
    resident,
    payment,
    settings,
    month = 'August 2026',
    customText,
    balance,
    complaintTitle,
    complaintStatus,
    complaintResolution
  } = payload;

  const propertyName = settings?.property_name || 'Hanura Casa Luxury Living';
  const upiId = settings?.upi_id || 'hanuracasa@icici';
  const roomInfo = resident.current_room_number
    ? `Room ${resident.current_room_number} (Bed ${resident.current_bed_number || 'A'})`
    : 'Resident Suite';

  const expectedAmount = resident.monthly_fee || 0;
  const currentBalance = balance !== undefined ? balance : expectedAmount;
  const paidAmount = payment ? payment.amount_paid : Math.max(0, expectedAmount - currentBalance);

  switch (type) {
    case 'PAYMENT_REMINDER':
      return `🌟 *${propertyName.toUpperCase()} - FEE REMINDER*\n\n` +
        `Dear *${resident.name}* (${roomInfo}),\n\n` +
        `This is a gentle reminder regarding your monthly hostel fee for *${month}*.\n\n` +
        `📊 *Fee Details:*\n` +
        `• Total Monthly Rent: *₹${expectedAmount.toLocaleString('en-IN')}*\n` +
        `• Amount Paid: *₹${paidAmount.toLocaleString('en-IN')}*\n` +
        `• *Outstanding Balance Due: ₹${currentBalance.toLocaleString('en-IN')}*\n\n` +
        `💳 *Pay Instantly via UPI:*\n` +
        `UPI ID: *${upiId}*\n\n` +
        `Kindly clear the pending balance to avoid any late fees. If you have already paid, please share the transaction screenshot.\n\n` +
        `_Thank you,_\n*Management Office, ${propertyName}*`;

    case 'PAYMENT_CONFIRMATION':
      return `✅ *${propertyName.toUpperCase()} - PAYMENT RECEIPT*\n\n` +
        `Dear *${resident.name}*,\n\n` +
        `We have successfully received your payment for *${month}*.\n\n` +
        `📄 *Receipt Summary:*\n` +
        `• Transaction Ref: *${payment?.transaction_reference || `HC-TXN-${Date.now().toString().slice(-6)}`}*\n` +
        `• Amount Received: *₹${(payment?.amount_paid || paidAmount).toLocaleString('en-IN')}*\n` +
        `• Advance Used: *₹${(payment?.advance_used || 0).toLocaleString('en-IN')}*\n` +
        `• Remaining Due: *₹${(payment?.balance || 0).toLocaleString('en-IN')}*\n` +
        `• Payment Mode: *${payment?.payment_method || 'UPI / Online'}*\n` +
        `• Suite: *${roomInfo}*\n\n` +
        `Your official digital receipt has been stamped and archived in your resident profile.\n\n` +
        `_Thank you for choosing ${propertyName}!_`;

    case 'KYC_REQUEST':
      return `🔒 *${propertyName.toUpperCase()} - DIGITAL KYC ALERT*\n\n` +
        `Dear *${resident.name}* (${roomInfo}),\n\n` +
        `As per government safety mandates and hostel administration protocols, please complete your Digital KYC identity verification.\n\n` +
        `📋 *Required Documents:*\n` +
        `1. Government Photo ID (Aadhaar / Passport / Voter ID)\n` +
        `2. College / University ID Card or Company ID\n` +
        `3. Emergency Contact Details\n\n` +
        `Please upload the document scans through the portal or share clear photos directly on this WhatsApp chat.\n\n` +
        `_Regards,_\n*Warden & Security Desk, ${propertyName}*`;

    case 'COMPLAINT_UPDATE':
      return `🛠️ *${propertyName.toUpperCase()} - SERVICE REQUEST UPDATE*\n\n` +
        `Dear *${resident.name}*,\n\n` +
        `Your maintenance / complaint ticket has been updated:\n\n` +
        `• Ticket: *${complaintTitle || 'Maintenance Request'}*\n` +
        `• Status: *${complaintStatus || 'RESOLVED'}*\n` +
        (complaintResolution ? `• Action Taken: _${complaintResolution}_\n\n` : '\n') +
        `If you need further assistance or the issue persists, please reply to this message.\n\n` +
        `_Hanura Casa Facilities Team_`;

    case 'GENERAL_ANNOUNCEMENT':
      return `📢 *${propertyName.toUpperCase()} - RESIDENT ANNOUNCEMENT*\n\n` +
        `Dear *${resident.name}*,\n\n` +
        `${customText || 'Important property maintenance announcement.'}\n\n` +
        `_Management Office, ${propertyName}_`;

    case 'CUSTOM':
    default:
      if (customText) {
        return customText
          .replace(/{{name}}/g, resident.name)
          .replace(/{{room}}/g, resident.current_room_number ? String(resident.current_room_number) : 'N/A')
          .replace(/{{bed}}/g, resident.current_bed_number !== null && resident.current_bed_number !== undefined ? String(resident.current_bed_number) : 'N/A')
          .replace(/{{month}}/g, month)
          .replace(/{{balance}}/g, `₹${currentBalance.toLocaleString('en-IN')}`)
          .replace(/{{expected}}/g, `₹${expectedAmount.toLocaleString('en-IN')}`)
          .replace(/{{paid}}/g, `₹${paidAmount.toLocaleString('en-IN')}`)
          .replace(/{{upi}}/g, upiId)
          .replace(/{{property}}/g, propertyName);
      }
      return `Hello *${resident.name}*, this is an official message from *${propertyName}*.`;
  }
}

/**
 * Returns the direct WhatsApp URL (https://wa.me/...)
 */
export function getDirectWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = cleanWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Opens WhatsApp Web or mobile app in a new window/tab directly with pre-filled message
 */
export function launchDirectWhatsApp(phone: string, message: string): boolean {
  try {
    const url = getDirectWhatsAppUrl(phone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  } catch (err) {
    console.error('Failed to launch WhatsApp:', err);
    return false;
  }
}
