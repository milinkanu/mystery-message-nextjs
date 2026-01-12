import {
    Html,
    Head,
    Font,
    Preview,
    Heading,
    Row,
    Section,
    Text,
    Container,
} from '@react-email/components';

interface VerificationEmailProps {
    username: string;
    otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>Verification Code</title>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Here&apos;s your verification code: {otp}</Preview>
            <Section style={{ backgroundColor: '#f0f2f5', padding: '40px 0' }}>
                <Container style={{
                    backgroundColor: '#ffffff',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #e1e4e8',
                    maxWidth: '500px'
                }}>
                    {/* Brand Accent */}
                    <Section style={{ borderBottom: '4px solid #000', marginBottom: '30px', width: '50px' }} />

                    <Row>
                        <Heading as="h2" style={{ color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px' }}>
                            Verify your email
                        </Heading>
                    </Row>

                    <Row>
                        <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', margin: '0 0 20px' }}>
                            Hi <strong>{username}</strong>,
                        </Text>
                        <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', margin: '0 0 30px' }}>
                            Thanks for joining <strong>Mystery Message</strong>. To complete your registration, please enter the following verification code:
                        </Text>
                    </Row>

                    <Row>
                        <Section style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px dashed #ced4da',
                            borderRadius: '8px',
                            padding: '20px',
                            textAlign: 'center',
                            marginBottom: '30px'
                        }}>
                            <Text style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: '#000',
                                margin: '0',
                                letterSpacing: '8px',
                                fontFamily: 'monospace'
                            }}>
                                {otp}
                            </Text>
                        </Section>
                    </Row>

                    <Row>
                        <Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>
                            If you didn't request this code, you can safely ignore this email.
                        </Text>
                    </Row>

                    {/* Footer */}
                    <Section style={{ borderTop: '1px solid #e1e4e8', marginTop: '40px', paddingTop: '20px' }}>
                        <Text style={{ fontSize: '14px', color: '#888', textAlign: 'center', margin: 0 }}>
                            © 2026 Mystery Message. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Section>
        </Html>
    );
}
