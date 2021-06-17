# JAMTools - Serverless Form System

An out of the box solution for JAMStack forms that can work across multiple sites, managed from a single source. 

### Frameworks & Services Used
- MailGun
- Serverless.com NodeJS SDK
- AWS (API Gateway, Lambda, SSM, SQS)

## Setup
Setup should be very quick. We start by adding environment variables, and 

### Environment Variables
For local development, a `.env` file is needed. 

For production, these variables can be added to SSM using the prefix `/JamTools/[env]/`. For example - for `MAILGUN_DOMAIN`, you would add an SSM param for `/JamTools/[env]/MAILGUN_DOMAIN`.

Environment variables will be needed for the following items: 
```
REGION
AWS_KEY
AWS_SECRET
JWT_ENCRYPTION_KEY
NOTIFICATIONS_QUEUE_URL
MAILGUN_API_KEY
MAILGUN_DOMAIN
EMAIL_FROM
DYNAMO_TABLE_PREFIX
```

### AWS Config
The Default AWS config will use your active entry in the AWS profiles for your AWS command line login. 

### Dynamo DB Setup
You need to setup Dynamo DB in your AWS account. On initial request, the models will be seeded and created. 

## Deployment
Deployment is done through serverless. 

`serverless deploy --stage prod` for prod.
`serverless deploy --stage dev` for dev.


## System Rundown
The system has 2 primary functions. First, you will need to add a form to the DB. After a form is added, entries can then be added to the form. Email notifications will be sent to each. 

For robust rundowns of endpoints and payloads, use included postman config file. 

### Create a Form
Creating a form can be done through the `form/add` endpoint. Include your API key from API Gateway (Given during serverless deploy command) in the `x-api-key` header. 

**Include a body payload like this:**
```
{
    "name": "FormName",
    "primary_key": "email", // your primary form key. Use email in most cases.
    "notification_email": "you@email.com" // the email address to send notifications to.
}
```

This will return a **form Token**. Use this in the next step

### Add an Entry
- First submit a GET request to `/form/token/[your form token]`. (Form Token from step above)
- This request will return a **submission token**
- With your **submission token** on hand, you can submit form data via POST to `/contact/add`
    - Submit your token as header: `Polymath-Form-Token`
    - Body can be raw JSON with the content of your form