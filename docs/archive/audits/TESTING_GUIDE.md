# 🧪 Testing Guide
**Grasshopper 26.00 - Comprehensive Testing Strategy**

---

## 📋 TESTING CHECKLIST

### ✅ Pre-Deployment Testing

#### 1. **Local Development Testing**
```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

**Verify**:
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Server starts successfully
- [ ] Homepage loads at http://localhost:3000

---

#### 2. **Unit Testing**
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Target Coverage**:
- Services: 80%+
- Utilities: 90%+
- Components: 70%+

---

#### 3. **Integration Testing**
```bash
# Run integration tests
npm run test
```

**Critical Flows to Test**:
- [ ] User authentication (signup, login, logout)
- [ ] Event creation and management
- [ ] Ticket purchase flow
- [ ] Message sending and receiving
- [ ] Chat room functionality
- [ ] Search functionality

---

#### 4. **End-to-End Testing**
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

**User Journeys**:
- [ ] Complete ticket purchase
- [ ] Build personal schedule
- [ ] Send direct message
- [ ] Join chat room
- [ ] View venue map
- [ ] Search for events

---

## 🎯 MANUAL TESTING CHECKLIST

### **Authentication & User Management**

#### Sign Up
- [ ] Email signup works
- [ ] Validation errors display correctly
- [ ] Confirmation email sent
- [ ] User redirected after signup

#### Login
- [ ] Email/password login works
- [ ] "Remember me" persists session
- [ ] Error messages for invalid credentials
- [ ] Redirect to intended page after login

#### Password Reset
- [ ] Reset email sent
- [ ] Reset link works
- [ ] Password successfully updated
- [ ] Can login with new password

---

### **Events**

#### Event Listing
- [ ] Events display correctly
- [ ] Filters work (status, type, date)
- [ ] Search functionality works
- [ ] Pagination works
- [ ] Images load properly

#### Event Details
- [ ] Event information displays
- [ ] Lineup shows correctly
- [ ] Schedule displays
- [ ] Venue map renders
- [ ] Ticket selector works

#### Event Creation (Admin)
- [ ] Form validation works
- [ ] Event created successfully
- [ ] Images upload correctly
- [ ] Event appears in listing

---

### **Ticketing**

#### Ticket Selection
- [ ] Ticket types display
- [ ] Quantity selector works
- [ ] Price calculates correctly
- [ ] Add to cart works
- [ ] Inventory limits enforced

#### Checkout
- [ ] Cart displays correctly
- [ ] Stripe checkout loads
- [ ] Test card (4242...) works
- [ ] Payment processes
- [ ] Confirmation page shows

#### Post-Purchase
- [ ] Confirmation email received
- [ ] Tickets appear in profile
- [ ] QR codes generated
- [ ] Ticket details correct

---

### **Messaging**

#### Direct Messages
- [ ] Can send message
- [ ] Message appears in thread
- [ ] Real-time updates work
- [ ] Unread count updates
- [ ] Mark as read works
- [ ] Message history loads

#### Chat Rooms
- [ ] Can join chat room
- [ ] Messages send successfully
- [ ] Real-time messages appear
- [ ] Participant count updates
- [ ] System messages work

---

### **Schedule Builder**

#### Schedule Grid
- [ ] Schedule displays correctly
- [ ] Can switch between days
- [ ] Stage filters work
- [ ] Grid/list view toggle works

#### Personal Schedule
- [ ] Can add sets to schedule
- [ ] Can remove sets
- [ ] Conflict detection works
- [ ] Conflict warnings display
- [ ] Schedule saves correctly

---

### **Venue Maps**

#### Map Display
- [ ] Map renders correctly
- [ ] Zoom in/out works
- [ ] Pan functionality works
- [ ] Reset button works

#### Amenities
- [ ] Amenity markers display
- [ ] Filters work
- [ ] Click to view details
- [ ] Legend displays

---

### **Search**

#### Global Search
- [ ] Search bar works
- [ ] Results display
- [ ] Typo tolerance works
- [ ] Filters work
- [ ] Results are relevant

#### Specific Searches
- [ ] Event search works
- [ ] Artist search works
- [ ] Product search works
- [ ] Content search works

---

### **Notifications**

#### Email
- [ ] Order confirmation sent
- [ ] Ticket delivery sent
- [ ] Event reminders sent
- [ ] Password reset sent

#### Push Notifications
- [ ] Permission request works
- [ ] Subscription saves
- [ ] Test notification works
- [ ] Event notifications work

#### SMS (if configured)
- [ ] Test SMS sends
- [ ] Event reminders send
- [ ] Ticket confirmations send

---

### **Mobile & PWA**

#### Responsive Design
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Touch interactions work

#### PWA Features
- [ ] Manifest loads
- [ ] Install prompt shows
- [ ] App installs correctly
- [ ] Offline mode works
- [ ] Push notifications work

---

### **Performance**

#### Load Times
- [ ] Homepage < 2 seconds
- [ ] Event page < 2 seconds
- [ ] Search < 1 second
- [ ] API responses < 200ms

#### Lighthouse Audit
```bash
npm run build
npm run start
npx lighthouse http://localhost:3000 --view
```

**Targets**:
- [ ] Performance > 90
- [ ] Accessibility > 95
- [ ] Best Practices > 95
- [ ] SEO > 95

---

### **Security**

#### Authentication
- [ ] Protected routes redirect
- [ ] Tokens expire correctly
- [ ] CSRF protection works
- [ ] XSS prevention works

#### Authorization
- [ ] Users can only access own data
- [ ] Admin routes protected
- [ ] RLS policies enforced
- [ ] API authentication works

#### Data Protection
- [ ] Passwords hashed
- [ ] Sensitive data encrypted
- [ ] No secrets in client code
- [ ] HTTPS enforced

---

## 🔧 TESTING TOOLS

### **Unit Testing**
- **Framework**: Vitest
- **Location**: `__tests__` directories
- **Command**: `npm run test:unit`

### **Integration Testing**
- **Framework**: Vitest
- **Location**: `/tests/integration`
- **Command**: `npm run test`

### **E2E Testing**
- **Framework**: Playwright
- **Location**: `/tests/e2e`
- **Command**: `npm run test:e2e`

### **Performance Testing**
- **Tool**: Lighthouse
- **Tool**: k6 (load testing)
- **Tool**: Chrome DevTools

---

## 📊 TEST COVERAGE GOALS

### **Current Status**
- Unit Tests: ~60%
- Integration Tests: ~40%
- E2E Tests: ~30%

### **Target Status**
- Unit Tests: 80%
- Integration Tests: 70%
- E2E Tests: 50%

---

## 🐛 BUG REPORTING

### **Template**
```markdown
## Bug Description
[Clear description of the issue]

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Device: [e.g., iPhone 15]

## Screenshots
[If applicable]

## Console Errors
[Any error messages]
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### **Code Quality**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code reviewed
- [ ] Documentation updated

### **Functionality**
- [ ] All features working
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Mobile responsive

### **Security**
- [ ] Security audit passed
- [ ] No vulnerabilities
- [ ] Secrets not exposed
- [ ] HTTPS configured

### **Data**
- [ ] Database migrated
- [ ] Seed data loaded
- [ ] Backups configured
- [ ] RLS policies active

### **Integrations**
- [ ] Stripe configured
- [ ] Resend configured
- [ ] Supabase configured
- [ ] Webhooks configured

---

## 🚀 PRODUCTION TESTING

### **Smoke Tests** (After Deployment)
1. [ ] Homepage loads
2. [ ] User can sign up
3. [ ] User can login
4. [ ] Events display
5. [ ] Ticket purchase works
6. [ ] Messages send
7. [ ] Search works

### **Monitoring** (First 24 Hours)
- [ ] Error rate < 1%
- [ ] Response time < 500ms
- [ ] Uptime > 99%
- [ ] No critical errors

### **User Acceptance** (First Week)
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Monitor performance
- [ ] Adjust as needed

---

## 📞 SUPPORT

### **Issues**
- Check existing tests
- Review error logs
- Check Sentry dashboard
- Review documentation

### **Help**
- Documentation: `/docs`
- API Docs: `/public/api-docs/openapi.yaml`
- Deployment Guide: `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

**Testing Guide Version**: 1.0.0  
**Last Updated**: January 7, 2025  
**Status**: Ready for Use ✅
