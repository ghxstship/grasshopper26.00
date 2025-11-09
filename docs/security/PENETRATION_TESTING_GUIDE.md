# Penetration Testing Guide

## Overview
This guide provides comprehensive penetration testing procedures for GVTEWAY (Grasshopper 26.00). It covers both automated and manual testing methodologies to identify security vulnerabilities before they can be exploited.

**Version:** 1.0  
**Last Updated:** 2025-01-09  
**Testing Frequency:** Quarterly (minimum) + Before major releases

---

## Table of Contents
1. [Testing Scope](#testing-scope)
2. [Pre-Testing Requirements](#pre-testing-requirements)
3. [Automated Testing Tools](#automated-testing-tools)
4. [Manual Testing Procedures](#manual-testing-procedures)
5. [Vulnerability Classification](#vulnerability-classification)
6. [Reporting & Remediation](#reporting--remediation)

---

## Testing Scope

### In-Scope Systems
- **Web Application:** https://gvteway.com
- **API Endpoints:** https://gvteway.com/api/*
- **Admin Portal:** https://gvteway.com/admin/*
- **Authentication System:** Supabase Auth
- **Payment Processing:** Stripe integration
- **Database:** Supabase PostgreSQL (RLS testing only)

### Out-of-Scope
- ❌ Third-party services (Stripe, Supabase infrastructure)
- ❌ Social engineering attacks
- ❌ Physical security
- ❌ Denial of Service (DoS) attacks
- ❌ Production database direct access

### Testing Environments
- **Staging:** https://staging.gvteway.com (preferred)
- **Production:** Limited testing with explicit approval only

---

## Pre-Testing Requirements

### 1. Authorization
- [ ] Written approval from stakeholders
- [ ] Testing window scheduled
- [ ] Stakeholders notified of testing activities
- [ ] Emergency contacts identified

### 2. Environment Setup
- [ ] Staging environment deployed
- [ ] Test accounts created (various roles)
- [ ] Monitoring alerts configured
- [ ] Backup created before testing

### 3. Test Accounts
```
Admin User:
  Email: pentester-admin@example.com
  Password: [Use secure password]

Standard User:
  Email: pentester-user@example.com
  Password: [Use secure password]

Artist User:
  Email: pentester-artist@example.com
  Password: [Use secure password]
```

---

## Automated Testing Tools

### 1. OWASP ZAP (Zed Attack Proxy)

**Installation:**
```bash
# macOS
brew install --cask owasp-zap

# Docker
docker pull owasp/zap2docker-stable
```

**Basic Scan:**
```bash
# Quick scan
zap-cli quick-scan https://staging.gvteway.com

# Full scan with authentication
zap-cli active-scan \
  --recursive \
  --scanners all \
  https://staging.gvteway.com
```

**Configuration:**
- Enable all scan policies
- Configure authentication (session cookies)
- Exclude logout and delete endpoints
- Set scan depth to 5 levels

### 2. Burp Suite Community Edition

**Installation:**
```bash
# Download from https://portswigger.net/burp/communitydownload
```

**Testing Workflow:**
1. Configure browser proxy (127.0.0.1:8080)
2. Browse application to build site map
3. Run automated scanner on key endpoints
4. Manual testing with Repeater and Intruder

**Key Features to Use:**
- Spider/Crawler
- Active Scanner
- Repeater (manual testing)
- Intruder (fuzzing)

### 3. Nuclei (Template-based Scanner)

**Installation:**
```bash
go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
```

**Run Scan:**
```bash
# Update templates
nuclei -update-templates

# Scan with all templates
nuclei -u https://staging.gvteway.com -t ~/nuclei-templates/

# Scan specific categories
nuclei -u https://staging.gvteway.com \
  -t ~/nuclei-templates/cves/ \
  -t ~/nuclei-templates/vulnerabilities/
```

### 4. SQLMap (SQL Injection Testing)

**Installation:**
```bash
git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git sqlmap-dev
```

**Test API Endpoints:**
```bash
# Test specific endpoint
python sqlmap.py -u "https://staging.gvteway.com/api/events?id=1" \
  --cookie="session=YOUR_SESSION_COOKIE" \
  --level=5 --risk=3

# Test POST request
python sqlmap.py -u "https://staging.gvteway.com/api/search" \
  --data="query=test" \
  --cookie="session=YOUR_SESSION_COOKIE"
```

### 5. Nikto (Web Server Scanner)

**Installation:**
```bash
brew install nikto
```

**Run Scan:**
```bash
nikto -h https://staging.gvteway.com -ssl -Format htm -output nikto-report.html
```

---

## Manual Testing Procedures

### 1. Authentication Testing

#### 1.1 Password Policy
- [ ] Test weak passwords (rejected)
- [ ] Test password complexity requirements
- [ ] Test password length limits (min 12 chars)
- [ ] Test common passwords (blocked)

#### 1.2 Login Security
- [ ] Test account lockout (5 failed attempts)
- [ ] Test timing attacks on login
- [ ] Test username enumeration
- [ ] Test remember me functionality
- [ ] Test concurrent sessions

#### 1.3 Password Reset
- [ ] Test reset token expiration (15 minutes)
- [ ] Test token reuse (should fail)
- [ ] Test reset link in email
- [ ] Test account enumeration via reset

#### 1.4 Session Management
- [ ] Test session timeout (30 minutes)
- [ ] Test session fixation
- [ ] Test session hijacking
- [ ] Test logout functionality
- [ ] Test token rotation

**Test Cases:**
```bash
# Test failed login attempts
for i in {1..6}; do
  curl -X POST https://staging.gvteway.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Test session timeout
# 1. Login and get session token
# 2. Wait 31 minutes
# 3. Try to access protected resource (should fail)
```

### 2. Authorization Testing

#### 2.1 Horizontal Privilege Escalation
- [ ] Test accessing other users' data
- [ ] Test modifying other users' profiles
- [ ] Test viewing other users' orders
- [ ] Test accessing other artists' dashboards

#### 2.2 Vertical Privilege Escalation
- [ ] Test admin endpoints as regular user
- [ ] Test artist endpoints as regular user
- [ ] Test modifying user roles
- [ ] Test accessing admin panel

#### 2.3 IDOR (Insecure Direct Object Reference)
```bash
# Test IDOR on user profile
curl https://staging.gvteway.com/api/users/123 \
  -H "Authorization: Bearer USER_TOKEN"

# Try accessing different user ID
curl https://staging.gvteway.com/api/users/456 \
  -H "Authorization: Bearer USER_TOKEN"

# Test IDOR on orders
curl https://staging.gvteway.com/api/orders/789 \
  -H "Authorization: Bearer USER_TOKEN"
```

### 3. Input Validation Testing

#### 3.1 XSS (Cross-Site Scripting)
Test payloads in all input fields:
```javascript
// Basic XSS
<script>alert('XSS')</script>

// Event handler
<img src=x onerror=alert('XSS')>

// SVG
<svg onload=alert('XSS')>

// Encoded
%3Cscript%3Ealert('XSS')%3C/script%3E

// DOM-based
#<img src=x onerror=alert('XSS')>
```

**Test Locations:**
- Profile fields (name, bio)
- Event descriptions
- Comments/reviews
- Search queries
- URL parameters

#### 3.2 SQL Injection
Test payloads:
```sql
-- Basic
' OR '1'='1
' OR '1'='1' --
' OR '1'='1' /*

-- Union-based
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--

-- Time-based
' AND SLEEP(5)--
' AND pg_sleep(5)--

-- Boolean-based
' AND 1=1--
' AND 1=2--
```

#### 3.3 Command Injection
```bash
# Test in file upload names, search queries
; ls -la
| whoami
`id`
$(whoami)
```

#### 3.4 Path Traversal
```bash
# Test file access endpoints
../../../etc/passwd
..%2F..%2F..%2Fetc%2Fpasswd
....//....//....//etc/passwd
```

### 4. API Security Testing

#### 4.1 Rate Limiting
```bash
# Test rate limits
for i in {1..150}; do
  curl https://staging.gvteway.com/api/events
  echo "Request $i"
done

# Should return 429 after 100 requests
```

#### 4.2 CORS Configuration
```bash
# Test CORS with different origins
curl -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  https://staging.gvteway.com/api/events
```

#### 4.3 API Authentication
```bash
# Test without auth token
curl https://staging.gvteway.com/api/admin/users

# Test with expired token
curl -H "Authorization: Bearer EXPIRED_TOKEN" \
  https://staging.gvteway.com/api/admin/users

# Test with manipulated token
curl -H "Authorization: Bearer MANIPULATED_TOKEN" \
  https://staging.gvteway.com/api/admin/users
```

### 5. Business Logic Testing

#### 5.1 Payment Processing
- [ ] Test negative amounts
- [ ] Test zero amounts
- [ ] Test very large amounts
- [ ] Test currency manipulation
- [ ] Test discount code abuse
- [ ] Test refund logic

#### 5.2 Credit System
- [ ] Test credit allocation
- [ ] Test credit expiration
- [ ] Test negative credits
- [ ] Test credit transfer
- [ ] Test concurrent credit usage

#### 5.3 Membership Tiers
- [ ] Test tier upgrade/downgrade
- [ ] Test access to tier-restricted content
- [ ] Test proration logic
- [ ] Test trial period abuse

### 6. File Upload Testing

#### 6.1 File Type Validation
```bash
# Test malicious file types
# 1. Upload .php file
# 2. Upload .exe file
# 3. Upload file with double extension (image.jpg.php)
# 4. Upload file with null byte (image.jpg%00.php)
```

#### 6.2 File Size Limits
```bash
# Test oversized files
dd if=/dev/zero of=large.jpg bs=1M count=100
curl -F "file=@large.jpg" https://staging.gvteway.com/api/upload
```

#### 6.3 File Content Validation
- [ ] Upload image with embedded script
- [ ] Upload SVG with XSS payload
- [ ] Upload ZIP bomb
- [ ] Upload polyglot file

---

## Vulnerability Classification

### Critical (P0)
- Remote code execution
- SQL injection with data access
- Authentication bypass
- Payment manipulation
- Sensitive data exposure

**SLA:** Fix within 24 hours

### High (P1)
- XSS (stored)
- CSRF on critical functions
- Privilege escalation
- Insecure direct object references
- Missing authentication

**SLA:** Fix within 7 days

### Medium (P2)
- XSS (reflected)
- Information disclosure
- Missing rate limiting
- Weak password policy
- Insecure session management

**SLA:** Fix within 30 days

### Low (P3)
- Missing security headers
- Verbose error messages
- Outdated dependencies
- Missing CSRF on non-critical functions

**SLA:** Fix within 90 days

### Informational
- Best practice recommendations
- Code quality issues
- Documentation gaps

**SLA:** Address as capacity allows

---

## Reporting & Remediation

### Vulnerability Report Template

```markdown
# Vulnerability Report

## Summary
[Brief description of the vulnerability]

## Severity
[Critical/High/Medium/Low/Informational]

## Affected Component
- URL: [Affected URL or endpoint]
- Parameter: [Affected parameter]
- Method: [GET/POST/etc.]

## Description
[Detailed description of the vulnerability]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Proof of Concept
```
[Code or screenshots demonstrating the vulnerability]
```

## Impact
[Potential impact if exploited]

## Remediation
[Recommended fix]

## References
- [OWASP reference]
- [CWE reference]
- [CVE reference if applicable]
```

### Remediation Workflow

1. **Triage** (24 hours)
   - Verify vulnerability
   - Assign severity
   - Assign owner

2. **Fix Development** (Per SLA)
   - Develop fix
   - Code review
   - Security review

3. **Testing** (Before deployment)
   - Unit tests
   - Integration tests
   - Retest vulnerability

4. **Deployment**
   - Deploy to staging
   - Verify fix
   - Deploy to production

5. **Verification**
   - Retest in production
   - Update documentation
   - Close ticket

---

## Automated Testing Script

Create a script to run regular automated tests:

```bash
#!/bin/bash
# File: scripts/security-scan.sh

TARGET="https://staging.gvteway.com"
REPORT_DIR="./security-reports/$(date +%Y-%m-%d)"

mkdir -p "$REPORT_DIR"

echo "Starting security scan of $TARGET"
echo "Report directory: $REPORT_DIR"

# 1. Nuclei scan
echo "Running Nuclei scan..."
nuclei -u "$TARGET" \
  -t ~/nuclei-templates/ \
  -o "$REPORT_DIR/nuclei-report.txt"

# 2. Nikto scan
echo "Running Nikto scan..."
nikto -h "$TARGET" \
  -Format htm \
  -output "$REPORT_DIR/nikto-report.html"

# 3. Security headers check
echo "Checking security headers..."
curl -I "$TARGET" > "$REPORT_DIR/headers.txt"

# 4. SSL/TLS check
echo "Checking SSL/TLS configuration..."
nmap --script ssl-enum-ciphers -p 443 "$TARGET" \
  > "$REPORT_DIR/ssl-report.txt"

echo "Security scan complete!"
echo "Reports saved to: $REPORT_DIR"
```

**Usage:**
```bash
chmod +x scripts/security-scan.sh
./scripts/security-scan.sh
```

---

## Continuous Security Testing

### GitHub Actions Integration

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM
  workflow_dispatch: # Manual trigger

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Nuclei
        uses: projectdiscovery/nuclei-action@main
        with:
          target: https://staging.gvteway.com
          
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: |
            nuclei-report.txt
            npm-audit.json
```

---

## Resources

### Tools
- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp)
- [Nuclei](https://github.com/projectdiscovery/nuclei)
- [SQLMap](https://sqlmap.org/)
- [Nikto](https://cirt.net/Nikto2)

### References
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Training
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)
- [HackTheBox](https://www.hackthebox.com/)

---

## Contact

**Security Team:** support@gvteway.com  
**Bug Bounty:** [URL if applicable]  
**Emergency:** [PHONE]

---

*This guide should be reviewed and updated quarterly or after significant application changes.*
