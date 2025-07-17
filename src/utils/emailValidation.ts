// List of known temporary/disposable email domains
// This list is regularly updated and includes the most common temporary email providers
const TEMPORARY_EMAIL_DOMAINS = [
  // 10 Minute Mail variants
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minemail.com',
  '20minutemail.com',
  
  // Guerrilla Mail variants
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'grr.la',
  
  // Mailinator variants
  'mailinator.com',
  'mailinator.net',
  'mailinator.org',
  'mailinator2.com',
  'notmailinator.com',
  'themailinator.com',
  'mailinator.gq',
  
  // TempMail variants
  'tempmail.org',
  'temp-mail.org',
  'tempmail.net',
  'tempmail.io',
  'tempmail.co',
  'tempmail.plus',
  'tempmailo.com',
  '1secmail.com',
  '1secmail.org',
  '1secmail.net',
  
  // YOPmail variants
  'yopmail.com',
  'yopmail.net',
  'yopmail.fr',
  'cool.fr.nf',
  'jetable.fr.nf',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'hide.biz.st',
  'mymail.infos.st',
  
  // Throwaway email services
  'throwaway.email',
  'throwawaymailbox.com',
  'throwawayemailaddresses.com',
  'trashmail.com',
  'trashmail.org',
  'trashmail.net',
  'trashinbox.com',
  'trashymail.com',
  'tempinbox.com',
  'spamgourmet.com',
  'spamgourmet.net',
  'spamgourmet.org',
  
  // Maildrop variants
  'maildrop.cc',
  'maildrop.cf',
  'maildrop.ga',
  'maildrop.gq',
  'maildrop.ml',
  'maildrop.tk',
  
  // Mohmal variants
  'mohmal.com',
  'mohmal.in',
  'mohmal.tech',
  
  // Other popular temporary email services
  'sharklasers.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'laoeq.com',
  'superrito.com',
  'teleworm.us',
  'rhyta.com',
  'doanart.com',
  'sample.email',
  'emltmp.com',
  'emlhub.com',
  'emlpro.com',
  'emltmp.net',
  'tempail.com',
  'tempemail.com',
  'tempr.email',
  'dispostable.com',
  'fakeinbox.com',
  'fake-mail.ml',
  'fakemail.net',
  'fakermail.com',
  'getnada.com',
  'harakirimail.com',
  'incognitomail.org',
  'instant-email.org',
  'mail-temporaire.fr',
  'mails.bg',
  'mintemail.com',
  'minuteinbox.com',
  'mytrashmail.com',
  'no-spam.ws',
  'noclickemail.com',
  'noemail.org',
  'oneoffmail.com',
  'opayq.com',
  'receivemail.org',
  'rootfest.net',
  'sendspamhere.com',
  'sogetthis.com',
  'spamhereplease.com',
  'spamthisplease.com',
  'speed.1s.fr',
  'tafmail.com',
  'tagyourself.com',
  'tempalias.com',
  'tempemailaddress.com',
  'tempymail.com',
  'thankyou2010.com',
  'thisisnotmyrealemail.com',
  'tmailinator.com',
  'trbvm.com',
  'whatiaas.com',
  'willhackforfood.biz',
  'wuzup.net',
  'yuurok.com',
  'zoemail.org',
  
  // Recently popular services
  'emailondeck.com',
  'emaildrop.io',
  'temp-mail.io',
  'temp-mail.ru',
  'tempmail.de',
  'atminmail.com',
  'atmintmp.com',
  'tempail.net',
  'tempail.org',
  'disposablemail.com',
  'burnermail.io',
  'dropmail.me',
  'inboxkitten.com',
  'mail.tm',
  'internxt.com',
  'guerrillamail.info',
  'guerrillamail.biz',
  'spam.la',
  'mailcatch.com',
  'mailnesia.com',
  'mailforspam.com',
  'mailexpire.com',
  'mailzilla.com',
  'mailzilla.org',
  'mailzilla.org',
  'e4ward.com',
  'gishpuppy.com',
  'guerrillamailblock.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.info',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.com',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'grr.la',
  'sharklasers.com'
];

/**
 * Advanced heuristic checks for temporary email patterns
 * This catches services that might not be in our hardcoded list
 * @param email - The email address to validate
 * @returns boolean - true if email appears to be temporary based on patterns
 */
function detectTemporaryEmailPatterns(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;

  // Common patterns in temporary email domains
  const suspiciousPatterns = [
    /temp/i,           // contains "temp"
    /mail.*temp/i,     // mail + temp
    /temp.*mail/i,     // temp + mail
    /disposable/i,     // contains "disposable"
    /throwaway/i,      // contains "throwaway"
    /fake/i,           // contains "fake"
    /spam/i,           // contains "spam"
    /trash/i,          // contains "trash"
    /guerrilla/i,      // guerrilla mail variants
    /mailinator/i,     // mailinator variants
    /\d+min/i,         // contains digits + "min" (like 10min)
    /minute/i,         // contains "minute"
    /sec.*mail/i,      // second mail
    /instant/i,        // instant mail
    /quick/i,          // quick mail
    /fast/i,           // fast mail
    /tmp/i,            // tmp mail
    /tempor/i,         // temporal
    /burner/i,         // burner mail
    /drop.*mail/i,     // drop mail
    /nospam/i,         // no spam
    /antispam/i,       // anti spam
    /mailcatch/i,      // mail catch
    /mailnesia/i,      // mailnesia variants
    /mailexpire/i,     // mail expire
    /mailzilla/i,      // mailzilla variants
  ];

  // Check if domain matches any suspicious pattern
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(domain)) {
      return true;
    }
  }

  // Check for very short domain names (often temporary services)
  const domainParts = domain.split('.');
  if (domainParts.length === 2 && domainParts[0].length <= 3) {
    // Very short domains like "a.b" are often temporary
    return true;
  }

  // Check for domains with excessive numbers (often auto-generated)
  const numberCount = (domain.match(/\d/g) || []).length;
  if (numberCount >= 3) {
    return true;
  }

  // Check for domains with suspicious TLDs commonly used by temporary services
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.cc', '.ws', '.st', '.nf'];
  for (const tld of suspiciousTlds) {
    if (domain.endsWith(tld)) {
      return true;
    }
  }

  return false;
}

/**
 * Enhanced version of isTemporaryEmail that uses both hardcoded list and pattern detection
 * @param email - The email address to validate
 * @returns boolean - true if the email is from a temporary service
 */
export function isTemporaryEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Extract domain from email
  const emailParts = email.toLowerCase().trim().split('@');
  if (emailParts.length !== 2) {
    return false;
  }

  const domain = emailParts[1];
  
  // First check hardcoded list
  if (TEMPORARY_EMAIL_DOMAINS.includes(domain)) {
    return true;
  }

  // Then check patterns
  return detectTemporaryEmailPatterns(email);
}

/**
 * Validates an email address for registration
 * @param email - The email address to validate
 * @returns object with validation result and error message
 */
export function validateEmailForRegistration(email: string): { 
  isValid: boolean; 
  error?: string; 
} {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Check for temporary email
  if (isTemporaryEmail(email)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not allowed. Please use a permanent email address.'
    };
  }

  // Additional validations can be added here
  // For example, checking for common typos in popular domains
  const domain = email.toLowerCase().split('@')[1];
  
  // Check for common Gmail typos
  const gmailTypos = ['gmai.com', 'gmail.co', 'gmial.com', 'gmaill.com'];
  if (gmailTypos.includes(domain)) {
    return {
      isValid: false,
      error: 'Did you mean gmail.com? Please check your email address.'
    };
  }

  // Check for common Yahoo typos
  const yahooTypos = ['yaho.com', 'yahoo.co', 'yahooo.com', 'yahoo.cm'];
  if (yahooTypos.includes(domain)) {
    return {
      isValid: false,
      error: 'Did you mean yahoo.com? Please check your email address.'
    };
  }

  // Check for common Outlook typos
  const outlookTypos = ['outlook.co', 'outloo.com', 'hotmai.com', 'hotmial.com'];
  if (outlookTypos.includes(domain)) {
    return {
      isValid: false,
      error: 'Did you mean outlook.com or hotmail.com? Please check your email address.'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Gets the list of blocked domains (for admin purposes)
 * @returns array of blocked domain names
 */
export function getBlockedDomains(): string[] {
  return [...TEMPORARY_EMAIL_DOMAINS];
}

/**
 * Adds a new domain to the blocked list (for dynamic blocking)
 * This would typically be stored in a database in production
 * @param domain - Domain to block
 */
export function addBlockedDomain(domain: string): void {
  const normalizedDomain = domain.toLowerCase().trim();
  if (!TEMPORARY_EMAIL_DOMAINS.includes(normalizedDomain)) {
    TEMPORARY_EMAIL_DOMAINS.push(normalizedDomain);
  }
} 