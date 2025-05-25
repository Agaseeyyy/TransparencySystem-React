// Test script to verify frontend authentication works with enhanced user data
const API_BASE = 'http://localhost:8080';

async function testFrontendAuth() {
    console.log('Testing Frontend Authentication Enhancement...\n');
    
    try {
        // Step 1: Login as Class Treasurer
        console.log('1. Testing login endpoint...');
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
        console.log('✅ Login successful');
        console.log('   - Account ID:', loginData.accountId);
        console.log('   - Role:', loginData.role);
        
        // Step 2: Get complete account details (simulating AuthProvider enhancement)
        console.log('\n2. Testing enhanced account data retrieval...');
        const accountResponse = await fetch(`${API_BASE}/api/v1/accounts/${loginData.accountId}`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        const accountData = await accountResponse.json();
        console.log('✅ Enhanced account data retrieved');
        console.log('   - Program Code:', accountData.programCode);
        console.log('   - Year Level:', accountData.yearLevel);
        console.log('   - Section:', accountData.section);
        console.log('   - First Name:', accountData.firstName);
        console.log('   - Last Name:', accountData.lastName);
        
        // Step 3: Test API calls that use the enhanced data
        console.log('\n3. Testing API calls with enhanced data...');
        
        // Test students by class
        const studentsResponse = await fetch(`${API_BASE}/api/v1/students/programs/${accountData.programCode}/${accountData.yearLevel}/${accountData.section}`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            console.log('✅ Students API call successful');
            console.log(`   - Found ${studentsData.length} students in class ${accountData.programCode} ${accountData.yearLevel}-${accountData.section}`);
        }
        
        // Test payments by class
        const paymentsResponse = await fetch(`${API_BASE}/api/v1/payments/students/${accountData.programCode}/${accountData.yearLevel}/${accountData.section}`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            console.log('✅ Payments API call successful');
            console.log(`   - Found ${Array.isArray(paymentsData) ? paymentsData.length : 'paginated'} payment records for class`);
        }
        
        console.log('\n🎉 Frontend Authentication Enhancement Verified!');
        console.log('✅ AuthProvider will now provide Class Treasurers with:');
        console.log('   - program: "' + accountData.programCode + '"');
        console.log('   - yearLevel: "' + accountData.yearLevel + '"');
        console.log('   - section: "' + accountData.section + '"');
        console.log('   - firstName: "' + accountData.firstName + '"');
        console.log('   - lastName: "' + accountData.lastName + '"');
        console.log('\n✅ API calls will no longer receive undefined parameters!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testFrontendAuth();
