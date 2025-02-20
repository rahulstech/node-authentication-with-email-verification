const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')

const sesClient = new SESClient({
    region: process.env.AMAZON_REGION,
    credentials: {
        accessKeyId: process.env.AMAZON_ID,
        secretAccessKey: process.env.AMAZON_SECRET,
    }
})

// send email using amazon simple email service
async function sendEmail(toAddress, subjectText, messageText) {
    const params = {
        Source: process.env.EMAIL_VERIFICATION_SENDER,
        Destination: {
            ToAddresses: [ toAddress ],
        },
        Message: {
            Subject: { 
                Data: subjectText,
            },

            Body: {
                Text: { 
                    Data: messageText
                },
            },
        }
    }

    const command = new SendEmailCommand(params)
    const response = await sesClient.send(command)

    console.log(`email successfully sent to ${toAddress} with response `, response)
}

module.exports = { 
    sendEmail,
}