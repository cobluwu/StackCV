
export interface VerificationResponse {
  type: 'email_verification' | 'otp_check';
  verified: boolean;
  email: string;
  domain?: string;
  otp?: string | null;
  reason: 'valid' | 'invalid_format' | 'unapproved_domain' | 'success' | 'wrong_otp' | 'otp_not_generated';
}

const APPROVED_DOMAINS = [
  '.ac.in',
  '.edu.in',
  '.edu',
  'student.amity.edu',
  'vitstudent.ac.in',
  'manipal.edu',
  'srmist.edu.in',
  'thapar.edu',
  'christuniversity.in',
  'jainuniversity.ac.in'
];

// Helper to format name from email (e.g. "john.doe" -> "John Doe")
const extractName = (email: string) => {
  try {
    const part = email.split('@')[0];
    return part.split(/[._]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  } catch (e) {
    return 'Student';
  }
};

// Simulated Email API Service
const sendEmail = async (email: string, otp: string) => {
  const name = extractName(email);
  const emailBody = `Hello ${name}, 

Your verification code for secure login is:

${otp}

This code expires in 10 minutes.

Once you're inside, you can complete your student verification to unlock discounted pricing and access your account features.

If you did not request this login, you can safely delete this email.

Regards,  
 StackCV Support.`;

  // Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Log as if sent by Email Provider
  console.group('%c 📨 Email Service Dispatched', 'color: #00C4A7; font-weight: bold; font-size: 12px;');
  console.log(`To: ${email}`);
  console.log(`Subject: Secure Login Verification`);
  console.log(emailBody);
  console.groupEnd();
};

export const initiateEmailVerification = async (email: string): Promise<VerificationResponse> => {
  const lowerEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(lowerEmail)) {
    return {
      type: "email_verification",
      verified: false,
      email: lowerEmail,
      reason: "invalid_format",
      otp: null
    };
  }

  // Extract domain
  const parts = lowerEmail.split('@');
  const domain = parts[parts.length - 1];

  // Validate Domain
  // TEMPORARY BYPASS: Allow any domain for demonstration purposes
  const isApproved = true; 
  // const isApproved = APPROVED_DOMAINS.some(d => domain.endsWith(d) || domain === d);

  if (!isApproved) {
    return {
      type: "email_verification",
      verified: false,
      email: lowerEmail,
      domain,
      reason: "unapproved_domain",
      otp: null
    };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Send Email via Simulated API
  await sendEmail(lowerEmail, otp);

  return {
    type: "email_verification",
    verified: true, // Eligible for OTP check
    email: lowerEmail,
    domain,
    reason: "valid",
    otp
  };
};

export const verifyOTP = async (email: string, inputOtp: string, generatedOtp: string | null): Promise<VerificationResponse> => {
   await new Promise(resolve => setTimeout(resolve, 500));
   
   if (!generatedOtp) {
     return {
       type: "otp_check",
       email,
       verified: false,
       reason: "otp_not_generated"
     };
   }

   if (inputOtp === generatedOtp) {
     return {
       type: "otp_check",
       email,
       verified: true,
       reason: "success"
     };
   }

   return {
     type: "otp_check",
     email,
     verified: false,
     reason: "wrong_otp"
   };
};
