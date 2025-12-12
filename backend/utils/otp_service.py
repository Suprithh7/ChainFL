"""
OTP (One-Time Password) Service for Patient Consent Verification.
Generates and verifies OTPs sent via email to ensure only patients can grant consent.
"""
import random
import string
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# In-memory OTP storage (use Redis in production)
otp_storage: Dict[str, Dict] = {}

# OTP Configuration
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5
MAX_OTP_ATTEMPTS = 3


def generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


def send_email_otp(email: str, patient_name: str) -> Tuple[bool, str, Optional[str]]:
    """
    Send OTP via email to patient.
    
    Args:
        email: Patient's email address
        patient_name: Patient's name
        
    Returns:
        Tuple of (success, message, otp_for_demo)
    """
    import smtplib
    import os
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    try:
        # Generate OTP
        otp = generate_otp()
        expiry_time = datetime.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        
        # Store OTP with metadata
        otp_storage[email] = {
            'otp': otp,
            'expiry': expiry_time,
            'attempts': 0,
            'patient_name': patient_name,
            'created_at': datetime.now()
        }
        
        # Get email configuration from environment variables
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        sender_email = os.getenv('SENDER_EMAIL', '')
        sender_password = os.getenv('SENDER_PASSWORD', '')
        
        # Check if email is configured
        if not sender_email or not sender_password:
            # Fallback to demo mode if not configured
            logger.warning("⚠️ Email not configured. Using demo mode.")
            logger.info(f"""
            ╔══════════════════════════════════════════════════════════╗
            ║              📧 EMAIL OTP NOTIFICATION (DEMO)            ║
            ╠══════════════════════════════════════════════════════════╣
            ║ To: {email:<50} ║
            ║ Subject: Your Consent Verification Code                 ║
            ╠══════════════════════════════════════════════════════════╣
            ║                                                          ║
            ║ Dear {patient_name},                                     ║
            ║                                                          ║
            ║ Your OTP for granting medical data consent is:          ║
            ║                                                          ║
            ║            🔐  {otp}  🔐                                 ║
            ║                                                          ║
            ║ This code will expire in {OTP_EXPIRY_MINUTES} minutes.  ║
            ║                                                          ║
            ╚══════════════════════════════════════════════════════════╝
            """)
            print(f"\n🔐 [DEMO MODE] OTP for {email}: {otp}\n")
            return True, f"OTP sent (demo mode) to {email}", otp
        
        # Create HTML email
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .otp-box {{ background: white; border: 3px dashed #667eea; padding: 20px; 
                           text-align: center; margin: 20px 0; border-radius: 8px; }}
                .otp-code {{ font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                            color: #667eea; font-family: monospace; }}
                .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; 
                           padding: 12px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🏥 ChainFL-Care</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Patient Consent Verification</p>
                </div>
                <div class="content">
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    
                    <p>You have received a request to grant consent for your medical data access. 
                    To verify your identity and authorize this request, please use the following One-Time Password (OTP):</p>
                    
                    <div class="otp-box">
                        <div style="color: #6c757d; font-size: 14px; margin-bottom: 10px;">Your Verification Code</div>
                        <div class="otp-code">{otp}</div>
                        <div style="color: #6c757d; font-size: 12px; margin-top: 10px;">
                            Valid for {OTP_EXPIRY_MINUTES} minutes
                        </div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong><br>
                        • This OTP is valid for only {OTP_EXPIRY_MINUTES} minutes<br>
                        • Do not share this code with anyone you don't trust<br>
                        • If you did not request this OTP, please ignore this email
                    </div>
                    
                    <p style="margin-top: 20px;">
                        <strong>What happens next?</strong><br>
                        Once you provide this OTP, your consent will be recorded on the blockchain, 
                        creating an immutable and transparent record of your authorization.
                    </p>
                    
                    <div class="footer">
                        <p>This is an automated message from ChainFL-Care.<br>
                        Please do not reply to this email.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create message
        message = MIMEMultipart('alternative')
        message['Subject'] = f'Your Consent Verification Code: {otp}'
        message['From'] = f"ChainFL-Care <{sender_email}>"
        message['To'] = email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        message.attach(html_part)
        
        # Send email via SMTP
        logger.info(f"📧 Sending OTP email to {email}...")
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Secure the connection
            server.login(sender_email, sender_password)
            server.send_message(message)
        
        logger.info(f"✅ OTP email sent successfully to {email}")
        print(f"\n✅ Real OTP email sent to {email}\n")
        
        return True, f"OTP sent successfully to {email}", None  # Don't return OTP in production
        
    except Exception as e:
        logger.error(f"Failed to send OTP: {e}")
        return False, f"Failed to send OTP: {str(e)}", None


def verify_otp(email: str, otp: str) -> Tuple[bool, str]:
    """
    Verify OTP for a patient email.
    
    Args:
        email: Patient's email address
        otp: OTP to verify
        
    Returns:
        Tuple of (success, message)
    """
    # Check if OTP exists for this email
    if email not in otp_storage:
        return False, "No OTP found for this email. Please request a new OTP."
    
    stored_data = otp_storage[email]
    
    # Check if OTP has expired
    if datetime.now() > stored_data['expiry']:
        del otp_storage[email]
        return False, "OTP has expired. Please request a new OTP."
    
    # Check attempt limit
    if stored_data['attempts'] >= MAX_OTP_ATTEMPTS:
        del otp_storage[email]
        return False, "Maximum OTP attempts exceeded. Please request a new OTP."
    
    # Verify OTP
    if stored_data['otp'] == otp:
        # OTP is correct - delete it (single use)
        del otp_storage[email]
        logger.info(f"✅ OTP verified successfully for {email}")
        return True, "OTP verified successfully"
    else:
        # Increment attempt counter
        stored_data['attempts'] += 1
        remaining_attempts = MAX_OTP_ATTEMPTS - stored_data['attempts']
        
        if remaining_attempts > 0:
            return False, f"Invalid OTP. {remaining_attempts} attempts remaining."
        else:
            del otp_storage[email]
            return False, "Invalid OTP. Maximum attempts exceeded. Please request a new OTP."


def cleanup_expired_otps():
    """Remove expired OTPs from storage."""
    current_time = datetime.now()
    expired_emails = [
        email for email, data in otp_storage.items()
        if current_time > data['expiry']
    ]
    
    for email in expired_emails:
        del otp_storage[email]
        logger.info(f"Cleaned up expired OTP for {email}")
    
    return len(expired_emails)


def get_otp_status(email: str) -> Optional[Dict]:
    """
    Get OTP status for debugging/admin purposes.
    
    Args:
        email: Patient's email address
        
    Returns:
        OTP status dict or None
    """
    if email not in otp_storage:
        return None
    
    data = otp_storage[email]
    time_remaining = (data['expiry'] - datetime.now()).total_seconds()
    
    return {
        'email': email,
        'patient_name': data['patient_name'],
        'attempts_used': data['attempts'],
        'attempts_remaining': MAX_OTP_ATTEMPTS - data['attempts'],
        'time_remaining_seconds': max(0, int(time_remaining)),
        'expires_at': data['expiry'].isoformat(),
        'created_at': data['created_at'].isoformat()
    }
