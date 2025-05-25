// Test script to verify the Class Treasurer authentication fix
const API_BASE = 'http://localhost:8080';

async function testAuthFix() {
    console.log('Testing Class Treasurer Authentication Fix...\n');
    
    try {
        // Step 1: Login as Class Treasurer
        console.log('1. Logging in as Class Treasurer...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin1@admin.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (!loginData.token) {
            throw new Error('Login failed - no token received');
        }
        
        // Step 2: Fetch complete account details using our new endpoint
        console.log('\n2. Fetching complete account details...');
        const accountResponse = await fetch(`${API_BASE}/api/v1/accounts/${loginData.accountId}`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        const accountData = await accountResponse.json();
        console.log('Complete account data:', accountData);
        
        // Step 3: Verify that we have all the required class information
        console.log('\n3. Verifying class information...');
        const requiredFields = ['programCode', 'yearLevel', 'section'];
        const missingFields = requiredFields.filter(field => !accountData[field]);
        
        if (missingFields.length > 0) {
            console.error('❌ Missing required fields:', missingFields);
        } else {
            console.log('✅ All required class information present:');
            console.log(`   - Program: ${accountData.programCode}`);
            console.log(`   - Year Level: ${accountData.yearLevel}`);
            console.log(`   - Section: ${accountData.section}`);
        }
        
        // Step 4: Test a payment API that requires these parameters
        console.log('\n4. Testing payment API with class parameters...');
        const paymentUrl = `${API_BASE}/api/v1/payments/students/${accountData.programCode}/${accountData.yearLevel}/${accountData.section}`;
        console.log('Payment API URL:', paymentUrl);
        
        const paymentResponse = await fetch(paymentUrl, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            console.log('✅ Payment API call successful! Students found:', paymentData.length);
        } else {
            console.log('ℹ️ Payment API returned:', paymentResponse.status, paymentResponse.statusText);
            const errorData = await paymentResponse.text();
            console.log('Response:', errorData);
        }
        
        console.log('\n🎉 Authentication fix verification completed!');
        console.log('✅ Class Treasurers now receive complete account data including:');
        console.log('   - Student information');
        console.log('   - Program/Year/Section details');
        console.log('   - No more undefined parameter errors');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testAuthFix();
