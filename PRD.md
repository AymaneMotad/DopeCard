X  Cards - Deep Product Requirements Document (PRD)
Executive Summary
Product Name: Digital Loyalty Card Platform (X Cards ) Version: 1.0 (70% Feature Parity MVP) Target Market: Small to medium-sized businesses (cafes, restaurants, retail stores, service providers) Core Value Proposition: Enable businesses to create, distribute, and manage digital loyalty cards for Apple Wallet and Google Pay without technical knowledge, replacing physical punch cards with mobile-native experiences.

1. Product Overview
1.1 Vision Statement
Create a user-friendly SaaS platform that allows businesses to digitize their customer loyalty programs, enabling them to reward customers, send push notifications, collect reviews, and grow their customer base through mobile wallet integration.
1.2 Target Users
Primary Users:
* Small business owners (cafes, bakeries, hair salons)
* Restaurant managers
* Retail store owners
* Service businesses (gyms, car washes, spas)
Secondary Users:
* Marketing managers
* Customer service staff
* End customers (loyalty card holders)
1.3 Key Success Metrics
* Number of active business accounts
* Total digital cards issued
* Monthly active card users
* Push notification engagement rates
* Customer retention improvement (30% average increase)
* Revenue increase for businesses (20% average)
* Referral program participation rate

2. Core Features & Functionality
2.1 Card Creation System (MVP - Simplified)
2.1.1 Card Templates
Priority: P0 (Critical)
Functional Requirements:
* Pre-built templates for 3 core loyalty card types (MVP):
    1. Stamp Card (2-50 stamps) - Traditional punch card loyalty program
    2. Points Card - Accumulate points, exchange for rewards
    3. Discount Card - Progressive discount based on visits
* Additional card types (Phase 2+):
    4. Coupon Card (one-time use promotions)
    5. Subscription Card (recurring payments via Stripe)
    6. Prepaid Card (cash balance, redeemable across visits)
    7. Multipass Card (bundle deals)
    8. Cash Back Card (percentage-based rewards)
Technical Specifications:
* JSON-based template structure stored in `passTemplates` table
* Template configuration via 5-section workflow
* Real-time preview generation
Business Rules (MVP):
* Stamp count: 2-50 stamps (configurable)
* Points: Configurable earning rate and redemption options
* Discount: Progressive tiers (e.g., 5%, 10%, 15% based on visits)
* Maximum 30 stamps for stamp cards (can be increased to 50)
* Configurable reward thresholds

2.1.2 Visual Customization (MVP - Simplified)
Priority: P0
Functional Requirements (MVP - Essential Only):
* Logo upload (PNG, JPG - max 2MB)
* Icon upload for push notifications (PNG - 192x192px recommended)
* Brand color selection:
    - Card background color
    - Text color
    - Primary accent color
* Basic preview (mobile mockup showing Apple Wallet/Google Pay styles)
* Future enhancements (Phase 2+):
    - Secondary accent color
    - Background image/pattern options
    - Font selection for card text
    - Advanced layout options
Technical Specifications:
* Image optimization (max 2MB per image)
* Real-time preview updates (< 500ms)
* Color contrast validation for accessibility (WCAG 2.1 Level AA)
* Preview shows both iOS and Android wallet styles

2.1.3 Card Information Fields (MVP - Simplified)
Priority: P0
Functional Requirements (MVP - Essential Only):
* Card title (required) - Appears on the card
* Business name (required)
* Card description (optional) - Short explanation
* Reward details (card-type specific):
    - Stamps: How to earn, reward description, stamp count for reward
    - Points: Points earning rate, reward catalog, redemption options
    - Discount: Discount tiers, purchases needed per tier
* Terms of use (optional) - Editable text field
* Future enhancements (Phase 2+):
    - Business description
    - Contact information (phone, address)
    - Operating hours
    - Social media links
    - Website URL
    - Online booking link
    - Active links section
    - Feedback/review links
Data Validation:
* Character limits per field
* Required field validation
* URL validation (if links added)
* Email validation (if contact email added)

2.1.4 Card Creation Workflow (MVP)
Priority: P0
The card creation follows a 5-section sequential workflow:

**Section 1: Card Type Selection**
* Display 3 card types with icons and descriptions
* Show use case examples for each type
* Require selection before proceeding
* Visual preview of selected card type

**Section 2: Settings (Essential Only)**
* Card expiration: 30/60/90/180/365 days or no expiration
* Language selection (default: account language)
* Basic form fields: Name, Email, Phone (required)
* Privacy policy toggle (optional)
* Future enhancements: Custom fields, UTM tracking, locations, etc.

**Section 3: Design**
* Logo upload
* Icon upload for notifications
* Color picker (background, text, accent)
* Real-time preview panel

**Section 4: Information**
* Card title
* Business name
* Description
* Reward details (card-type specific)
* Terms of use

**Section 5: Save & Preview**
* Generate QR code
* Generate distribution link
* Preview card in wallet format
* Activate card

2.2 Customer Management & Card Distribution
2.2.1 Customer Registration Form
Priority: P0
Functional Requirements:
* Customizable registration form builder
* Required fields:
    * First name
    * Last name
    * Phone number
    * Date of birth (optional)
* Email collection (optional)
* GDPR/CCPA compliance checkboxes
* Duplicate customer detection
* Automatic CRM integration
Technical Specifications:
* Form validation (client and server-side)
* Anti-spam protection (CAPTCHA)
* Mobile-optimized input fields
* Progressive form design
2.2.2 Card Distribution Methods
Priority: P0
Distribution Channels:
1. QR Code Generation
    * Printable PDF with QR code
    * Digital display QR code
    * Dynamic QR linking to registration page
2. Direct Link Sharing
    * Shareable URL for social media
    * Copy-to-clipboard functionality
    * URL shortening integration
    * UTM parameter support
3. Website Widget (Premium)
    * Embeddable registration widget
    * Customizable appearance
    * Auto-installation flow
4. Bulk Import (Premium)
    * CSV upload for existing customer base
    * Field mapping interface
    * Duplicate detection
    * Batch card issuance
Technical Specifications:
* QR code generation using industry-standard libraries
* Pass format: PKPass (Apple), JWT (Google)
* Secure token generation
* SSL/TLS encryption for all data transfer
2.2.3 Card Installation Flow
Priority: P0
User Journey:
1. Customer scans QR code or clicks link
2. Registration form appears
3. Customer fills out information
4. System validates and checks for duplicates
5. Card is generated
6. "Add to Apple Wallet" or "Add to Google Pay" button appears
7. Card is installed in digital wallet
Platform-Specific Requirements:
iOS (Apple Wallet):
* PKPass file generation
* Push certificate management
* Update tokens for modifications
* Background color, foreground color, label color
* Barcode/QR code generation (Code128, QR, Aztec)
Android (Google Pay):
* JWT-based pass generation
* Google Pay API integration
* Instant app fallback for unsupported regions
* Branding elements for non-Google Wallet regions

2.3 Scanner Application
2.3.1 Scanner App Core Features
Priority: P0
Functional Requirements:
* Web-based scanner (no app download required)
* Camera-based QR code scanning
* Manual card lookup (by customer name/phone)
* Add stamps/points interface
* Redeem rewards interface
* Transaction amount entry (optional)
* Offline mode with sync
* Transaction history view
Technical Specifications:
* Progressive Web App (PWA)
* Camera API integration
* WebRTC for camera access
* IndexedDB for offline storage
* Service worker for background sync
* Response time: <2 seconds per scan
User Interface:
* Large scan button
* Customer name/balance display
* Simple increment/decrement controls
* Visual feedback on successful scan
* Error handling for invalid codes
2.3.2 Manager Accounts
Priority: P1
Functional Requirements:
* Multi-user access management
* Role-based permissions:
    * Owner (full access)
    * Manager (card management, scanning)
    * Staff (scanning only)
* Activity logging per user
* Login tracking
* Session management (single device login enforcement)
* Password reset functionality
Security Requirements:
* Session timeout after 30 minutes
* Logout on multiple device detection
* Incognito/private mode warnings
* Failed login attempt tracking
Technical Specifications:
* JWT-based authentication
* Role-based access control (RBAC)
* Audit log storage
* Real-time session validation

2.4 Push Notification System
2.4.1 Manual Push Messages
Priority: P0
Functional Requirements:
* Rich text editor for message composition
* Character limit: 255 characters
* Link embedding
* Image attachment (optional, premium)
* Recipient selection:
    * All customers
    * Specific segments
    * Individual customers
* Schedule for later sending
* Message preview before sending
Technical Specifications:
* Apple Push Notification Service (APNS) integration
* Google Cloud Messaging (GCM) integration
* Message queue system
* Delivery status tracking
* Click-through rate analytics
2.4.2 Automated Push Notifications
Priority: P1
Pre-built Automation Triggers:
1. Welcome Message
    * Sent: Upon card installation
    * Customizable welcome text
    * Optional first-time reward
2. Birthday Message
    * Sent: X days before birthday (configurable)
    * Special birthday offer
    * Personalization tokens
3. Reward Earned
    * Sent: When customer earns a reward
    * Congratulatory message
    * Redemption instructions
4. Reward About to Expire
    * Sent: X days before expiration
    * Urgency messaging
    * Direct redemption link
5. Inactivity Re-engagement
    * Sent: After X days of no activity
    * Win-back offer
    * "We miss you" messaging
6. Milestone Celebrations
    * Sent: After X visits/points
    * Achievement unlocked messaging
    * Bonus reward
Technical Specifications:
* Event-driven architecture
* Scheduled job processing
* Template system with variable substitution
* A/B testing support (premium)
* Frequency capping to prevent spam
2.4.3 Geo-Based Push Notifications
Priority: P1
Functional Requirements:
* Define up to 10 business locations
* Set radius: 50-500 meters
* Trigger message when customer enters radius
* Frequency limits: max 1 per day per location
* Time restrictions: only during business hours
* Custom message per location
Technical Specifications:
* Geofencing API integration
* Location privacy compliance
* Battery-efficient location monitoring
* Fallback for location services disabled
2.4.4 Custom Auto-Push Builder
Priority: P2 (Premium Feature)
Functional Requirements:
* Visual workflow builder
* Trigger configuration:
    * Number of stamps/points
    * Days since last visit
    * Total spending amount
    * First visit
    * Referral completion
* Condition logic (if/then)
* Multi-step campaigns
* Delay configuration between steps
Technical Specifications:
* Drag-and-drop interface
* JSON-based workflow storage
* Background job scheduler
* Campaign analytics dashboard

2.5 Review Collection System
2.5.1 Review Request Automation
Priority: P1
Functional Requirements:
* Integrated review platforms:
    * Google Reviews
    * Trustpilot
    * TripAdvisor
    * Custom review page
* Automatic review request after X visits/purchases
* Link directly from card to review page
* Remind customers via push notification
* Email notification for new reviews
Review Filtering:
* Pre-screening for sentiment (optional)
* Negative review email alerts to business owner
* Option to address negative reviews before public posting
Technical Specifications:
* OAuth integration with review platforms
* Review platform API connections
* Sentiment analysis (basic keyword detection)
* Email notification system

2.6 Referral Program
2.6.1 Referral Mechanics
Priority: P1
Functional Requirements:
* Unique referral link per customer
* QR code generation for in-person referrals
* Configurable referral rewards:
    * Stamps earned for referrer
    * Stamps earned for referee
    * Bonus trigger: first purchase vs. card installation
* Share via:
    * SMS
    * WhatsApp
    * Facebook
    * Instagram
    * Email
    * Native share sheet
Technical Specifications:
* Unique referral code generation
* Referral tracking via URL parameters
* Anti-fraud detection (duplicate accounts)
* Referral attribution window: 30 days
* Real-time reward crediting
Analytics:
* Total referrals per customer
* Conversion rate tracking
* Most effective sharing channels
* Referral revenue attribution

2.7 Integration & Webhooks
2.7.1 Webhook System
Priority: P2 (Premium Feature)
Functional Requirements:
* Webhook endpoint configuration
* Event subscription:
    * New card installation
    * Stamp/point added
    * Reward redeemed
    * Card updated
    * Card deleted
    * Customer updated
* Retry logic for failed deliveries
* Webhook signature verification
* Webhook testing interface
Technical Specifications:
* HTTPS POST requests
* JSON payload format
* HMAC-SHA256 signature
* Retry policy: 3 attempts with exponential backoff
* Timeout: 10 seconds
Sample Webhook Payload:
{
  "event_type": "stamp.added",
  "timestamp": "2025-11-11T10:30:00Z",
  "card_id": "card_abc123",
  "customer": {
    "id": "cust_xyz789",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
  },
  "data": {
    "stamps_current": 5,
    "stamps_total": 10,
    "transaction_amount": 15.50
  }
}
2.7.2 API Access
Priority: P2 (Premium Feature)
Functional Requirements:
* RESTful API
* API key management
* Rate limiting: 1000 requests/hour
* API documentation (OpenAPI/Swagger)
* SDKs: JavaScript, Python, Ruby
Core API Endpoints:
* POST /api/v1/customers - Create customer
* GET /api/v1/customers/{id} - Get customer details
* POST /api/v1/transactions - Add stamp/points
* POST /api/v1/rewards/redeem - Redeem reward
* GET /api/v1/cards - List cards
* POST /api/v1/notifications - Send push notification

2.8 Analytics Dashboard
2.8.1 Business Metrics
Priority: P1
Dashboard Components:
1. Overview Metrics:
    * Total active customers
    * Cards issued this month
    * Average stamps/points per customer
    * Redemption rate
    * Customer acquisition cost
2. Engagement Metrics:
    * Push notification open rate
    * Click-through rate
    * Active customers (visited in last 30 days)
    * Inactive customers
    * Churn rate
3. Financial Metrics:
    * Total transaction volume
    * Average transaction value
    * Revenue per customer
    * ROI of loyalty program
    * Referral revenue
4. Customer Insights:
    * New vs. returning customers
    * Geographic distribution (map view)
    * Peak visit times (heatmap)
    * Popular rewards
    * Customer lifetime value
Visualization Types:
* Line charts for trends
* Bar charts for comparisons
* Pie charts for distribution
* Maps for location data
* Tables for detailed data
Export Options:
* CSV export
* PDF reports
* Scheduled email reports (weekly/monthly)

3. Technical Architecture
3.1 System Architecture
Frontend:
* React/Next.js for web dashboard
* Progressive Web App (PWA) for scanner
* Responsive design (mobile-first)
* State management: Redux or Zustand
* UI framework: Tailwind CSS + shadcn/ui
Backend:
* Node.js with Express.js or Python with Django/FastAPI
* PostgreSQL for relational data
* Redis for caching and session management
* AWS S3 for file storage
* Message queue: RabbitMQ or AWS SQS
Mobile Wallet Integration:
* Apple PassKit for iOS
* Google Pay API for Android
* Pass generation service
* Push notification service
Infrastructure:
* Cloud provider: AWS, Google Cloud, or Azure
* CDN: CloudFlare
* Load balancer
* Auto-scaling groups
* Database replication
* Backup and disaster recovery
3.2 Security Requirements
Authentication & Authorization:
* JWT-based authentication
* OAuth 2.0 for third-party integrations
* Role-based access control
* Two-factor authentication (optional)
* Password policies (minimum 8 characters, special chars)
Data Protection:
* AES-256 encryption at rest
* TLS 1.3 for data in transit
* PII data encryption
* GDPR compliance
* CCPA compliance
* Right to be forgotten implementation
Security Measures:
* Rate limiting on API endpoints
* DDoS protection
* SQL injection prevention
* XSS protection
* CSRF tokens
* Regular security audits
* Penetration testing (annual)
3.3 Performance Requirements
Response Times:
* Page load time: <2 seconds
* API response time: <500ms
* Card generation time: <3 seconds
* Scanner app scan time: <2 seconds
Scalability:
* Support 10,000+ concurrent users
* Handle 1M+ cards issued
* Process 100,000+ transactions/day
* 99.9% uptime SLA
Availability:
* Multi-region deployment
* Automatic failover
* Database replication
* Backup frequency: every 6 hours
* Recovery time objective (RTO): 4 hours
* Recovery point objective (RPO): 1 hour

4. Pricing Model
4.1 Pricing Tiers
Free Plan
Price: $0/month
* 1 active card
* 1 scanner app login
* 1 location for geo-push
* Unlimited customers
* Unlimited push messages
* Review collection
* ❌ Custom field names
* ❌ Referral program
* ❌ Automated push messages
* ❌ Webhook integration
Starter Plan
Price: $29/month (suggested)
* Up to 3 active cards
* 10 scanner app logins
* 3 locations for geo-push
* Unlimited customers
* Unlimited push messages
* Review collection
* ✅ Custom field names
* ✅ Referral program
* ✅ 4 automatic push messages
* ❌ Custom auto-push builder
* ❌ Webhook integration
* ❌ Customizable manager permissions
Professional Plan
Price: $79/month (suggested)
* Up to 10 active cards
* 50 scanner app logins
* 10 locations for geo-push
* Unlimited customers
* Unlimited push messages
* Review collection
* ✅ Custom field names
* ✅ Referral program
* ✅ 4 automatic push messages
* ✅ Custom auto-push builder
* ✅ Webhook integration
* ✅ Customizable manager permissions
* ✅ Priority support
* ✅ API access
Enterprise Plan
Price: Custom pricing
* Unlimited cards
* Unlimited scanner logins
* Unlimited locations
* White-label option
* Dedicated account manager
* Custom integrations
* SLA guarantee
* On-premise deployment option
4.2 Additional Revenue Streams
Add-ons:
* Additional cards: $5/card/month
* Additional scanner logins: $3/login/month
* Premium support: $50/month
* Custom development: $150/hour
Transaction Fees:
* Subscription cards (Stripe integration): 2.9% + $0.30 per transaction

5. User Experience (UX) Design
5.1 Dashboard Navigation
Main Navigation Menu:
1. Dashboard - Overview metrics
2. Cards - Create and manage loyalty cards
3. Customers - Customer database and segmentation
4. Transactions - Transaction history
5. Notifications - Push message management
6. Analytics - Reports and insights
7. Settings - Account and business settings
8. Help - Documentation and support
5.2 Card Creation Wizard
Step 1: Select Template
* Visual cards showing each template type
* Description of use case for each
* "Start from scratch" option
Step 2: Design
* Logo upload
* Color picker
* Background selection
* Preview panel (live update)
Step 3: Information
* Business details form
* Promotion terms
* Contact information
* Social links
Step 4: Configure
* Stamps/points settings
* Reward thresholds
* Referral program toggle
* Expiration rules
Step 5: Distribute
* QR code download
* Link generation
* Social media sharing
* Email invitation
5.3 Mobile Scanner App UX
Home Screen:
* Large "Scan" button (center)
* Recent scans (quick access)
* Customer search bar
* Settings icon
Scan Flow:
1. Tap "Scan" button
2. Camera activates
3. Point at customer's QR code
4. Card appears with customer name
5. Select action: Add stamps/points or Redeem reward
6. Confirm transaction
7. Success feedback
Offline Mode:
* Visual indicator (banner)
* Queue pending transactions
* Auto-sync when online
* Conflict resolution

6. Competitive Analysis
6.1 Key Competitors
* Stamp Me - Digital stamp cards
* LoyaltyLion - E-commerce loyalty
* Yotpo - Reviews + loyalty
* Belly - Tablet-based loyalty
* FiveStars - Customer engagement platform
6.2 Competitive Advantages
1. No hardware required - Scanner app runs on any device
2. Unlimited push notifications - No SMS costs
3. Built-in review collection - Multi-platform support
4. Geo-based notifications - Proximity marketing
5. Simple pricing - Transparent, no hidden fees
6. Fast onboarding - 15-minute setup
7. Mobile-first design - Native wallet integration
6.3 Differentiation Strategy
* Focus on small businesses (under-served market)
* Emphasize ease of use over advanced features
* Free tier with unlimited customers
* No transaction fees (except Stripe integration)
* Local business optimization (geo-push)

7. Go-to-Market Strategy
7.1 Target Market Segmentation
Primary Target:
* Coffee shops and cafes
* Restaurants (dine-in and takeout)
* Hair salons and barbers
* Retail boutiques
* Car washes
Secondary Target:
* Fitness studios and gyms
* Pet grooming services
* Nail salons and spas
* Dry cleaners
* Local service providers
7.2 Customer Acquisition Channels
Paid Advertising:
* Google Ads (search: "digital loyalty card")
* Facebook/Instagram Ads (local business targeting)
* LinkedIn Ads (B2B targeting)
Content Marketing:
* Blog posts (SEO optimized)
* YouTube tutorials
* Case studies
* Webinars
Partnerships:
* POS system integrations (Square, Clover)
* Small business associations
* Chamber of Commerce
* Business consultants
Direct Sales:
* Outbound email campaigns
* Cold calling
* In-person demos at trade shows
* Local business networking events
7.3 Onboarding Strategy
New User Journey:
1. Sign up (email + password)
2. Choose business type (from dropdown)
3. Load pre-configured template
4. Customize logo and colors
5. Generate first card
6. Download QR code
7. First customer signs up
8. Complete first transaction
9. Send first push notification
10. Success! (Onboarding complete badge)
Email Drip Campaign:
* Day 0: Welcome email + getting started guide
* Day 1: Video tutorial (how to create a card)
* Day 3: Tips for promoting your card
* Day 7: Best practices for push notifications
* Day 14: Advanced features (referral program)
* Day 30: Monthly check-in + success stories

8. Development Roadmap
8.1 Phase 1: MVP (Months 1-3)
Core Features:
* ✅ Card creation (stamp, points, discount)
* ✅ Customer registration form
* ✅ QR code distribution
* ✅ Apple Wallet & Google Pay integration
* ✅ Scanner app (basic)
* ✅ Manual push notifications
* ✅ Basic analytics dashboard
* ✅ User authentication
Deliverable: Working product with 70% feature parity
8.2 Phase 2: Enhanced Features (Months 4-6)
Added Features:
* ✅ Automated push notifications (4 pre-built)
* ✅ Referral program
* ✅ Review collection integration
* ✅ Geo-based push notifications
* ✅ Manager accounts
* ✅ Advanced analytics
* ✅ CSV customer import
Deliverable: Feature-complete product ready for paid launch
8.3 Phase 3: Premium Features (Months 7-9)
Added Features:
* ✅ Webhook integration
* ✅ API access
* ✅ Custom auto-push builder
* ✅ A/B testing for notifications
* ✅ White-label options
* ✅ Multi-location support
* ✅ Subscription cards (Stripe integration)
Deliverable: Enterprise-ready platform
8.4 Phase 4: Scale & Optimize (Months 10-12)
Focus Areas:
* Performance optimization
* UI/UX improvements based on user feedback
* Mobile app development (iOS/Android)
* Advanced segmentation
* Predictive analytics
* AI-powered recommendations
* International expansion (multi-language)

9. Success Metrics & KPIs
9.1 Business Metrics
* Monthly Recurring Revenue (MRR)
* Customer Acquisition Cost (CAC)
* Customer Lifetime Value (LTV)
* LTV:CAC ratio (target: 3:1)
* Churn rate (target: <5% monthly)
* Net Revenue Retention (NRR)
9.2 Product Metrics
* Daily Active Users (DAU)
* Weekly Active Users (WAU)
* Cards created per user
* Average scans per card per day
* Push notification open rate (target: >15%)
* Referral conversion rate (target: >20%)
* Time to first transaction (target: <48 hours)
9.3 Customer Success Metrics
* Customer onboarding completion rate (target: >70%)
* Time to value (first successful transaction)
* Feature adoption rate
* Support ticket volume
* Net Promoter Score (NPS) (target: >50)
* Customer satisfaction score (CSAT)

10. Risk Assessment & Mitigation
10.1 Technical Risks
Risk: Apple/Google changes wallet API Probability: Medium Impact: High Mitigation: Monitor developer forums, maintain backward compatibility, build abstraction layer
Risk: Service outages during peak hours Probability: Low Impact: High Mitigation: Multi-region deployment, automatic failover, real-time monitoring
Risk: Data breach Probability: Low Impact: Critical Mitigation: Regular security audits, encryption, compliance certifications, incident response plan
10.2 Business Risks
Risk: Low customer adoption Probability: Medium Impact: High Mitigation: Freemium model, aggressive marketing, partnership channels, customer education
Risk: High customer acquisition cost Probability: Medium Impact: Medium Mitigation: Content marketing, referral program, word-of-mouth, optimize ad campaigns
Risk: Competitive pressure from larger players Probability: High Impact: Medium Mitigation: Focus on niche market, superior customer service, faster innovation cycles
10.3 Regulatory Risks
Risk: GDPR/CCPA compliance violations Probability: Low Impact: Critical Mitigation: Legal counsel, compliance framework, regular audits, data processing agreements
Risk: Mobile wallet policy changes Probability: Medium Impact: High Mitigation: Diversify across platforms, monitor policy updates, flexible architecture

11. Support & Documentation
11.1 Customer Support Channels
* Help Center - Searchable knowledge base
* Video Tutorials - Step-by-step guides
* Email Support - support@company.com (24-hour response time)
* Live Chat - Business hours (9 AM - 6 PM)
* Phone Support - Premium customers only
* Community Forum - Peer-to-peer support
11.2 Documentation
* Getting Started Guide
* Card Design Best Practices
* Push Notification Copywriting Tips
* Scanner App User Manual
* API Documentation (for developers)
* Webhook Integration Guide
* Troubleshooting FAQ
* Video Library (YouTube channel)

12. Appendix
12.1 Glossary of Terms
* PKPass: Apple's proprietary pass format for Wallet
* JWT: JSON Web Token used for Google Pay
* Geofencing: Location-based technology that triggers actions
* Push Notification: Messages sent to device lock screen
* Stamp Card: Digital punch card replacement
* Points Card: Accumulate points system
* CRM: Customer Relationship Management
12.2 References
* Apple PassKit Documentation
* Google Pay API Documentation
* GDPR Compliance Guidelines
* CCPA Compliance Requirements
* Push Notification Best Practices (APNS, GCM)

Document Control
Version History:
* v1.0 - November 11, 2025 - Initial PRD creation
Approval:
* Product Manager: [Signature Required]
* Engineering Lead: [Signature Required]
* Design Lead: [Signature Required]
* CEO/Founder: [Signature Required]
Next Review Date: February 11, 2026

This PRD represents a comprehensive blueprint for building a 70% feature-equivalent product to Highlight Cards. Prioritization should focus on the P0 (critical) features first, followed by P1 (important) and P2 (nice-to-have) features based on market feedback and resource availability.
