// Rate limiting variabelen voor Free VPN
const VPN_REQUESTS_PER_HOUR = 1000;
const VPN_REQUESTS_PER_MONTH = 50;
const vpnRequestsThisHour = new Map();
let vpnRequestsThisMonth = 0;

async function changeNetflixRegion() {
    const proxyStatus = document.getElementById('proxy-status');
    
    // Check uurlimiet
    const now = new Date().getTime();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Verwijder oude requests
    for (const [timestamp] of vpnRequestsThisHour) {
        if (timestamp < hourAgo) {
            vpnRequestsThisHour.delete(timestamp);
        }
    }
    
    // Check limieten
    if (vpnRequestsThisHour.size >= VPN_REQUESTS_PER_HOUR) {
        proxyStatus.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Te veel VPN-verzoeken in het afgelopen uur. Probeer het later opnieuw.</p>
            </div>`;
        return;
    }

    if (vpnRequestsThisMonth >= VPN_REQUESTS_PER_MONTH) {
        proxyStatus.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Maandelijkse VPN-limiet bereikt. Wacht tot volgende maand of upgrade je plan.</p>
            </div>`;
        return;
    }
    
    // Voeg huidige request toe aan tellers
    vpnRequestsThisHour.set(now, true);
    vpnRequestsThisMonth++;
    
    const selectedRegion = document.getElementById('region-select').value;
    const loadingSpinner = '<i class="fas fa-spinner fa-spin"></i> VPN wordt geconfigureerd...';
    
    proxyStatus.innerHTML = loadingSpinner;
    
    try {
        const response = await fetch('https://free-vpn.p.rapidapi.com/get_vpn_data', {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'fe4fe3d236msh46e7bd6b07ee898p1205b9jsnf93951d84210',
                'X-RapidAPI-Host': 'free-vpn.p.rapidapi.com'
            }
        });
        
        // Check remaining requests header
        const remainingRequests = response.headers.get('X-RateLimit-Remaining');
        if (remainingRequests && parseInt(remainingRequests) < 10) {
            console.warn(`Nog maar ${remainingRequests} VPN requests over deze maand`);
        }
        
        const data = await response.json();
        
        if (data && data.vpn_servers && data.vpn_servers.length > 0) {
            const server = data.vpn_servers[0];
            proxyStatus.innerHTML = `
                <div class="ip-status success">
                    <i class="fas fa-check-circle"></i>
                    <p>VPN verbonden met ${selectedRegion.toUpperCase()}:</p>
                    <ul>
                        <li>Server IP: ${server.ip}</li>
                        <li>Land: ${server.country}</li>
                        <li>Snelheid: ${server.speed} Mbps</li>
                        <li>Ping: ${server.ping}ms</li>
                    </ul>
                </div>`;
        } else {
            throw new Error('Geen VPN servers beschikbaar voor deze regio');
        }
    } catch (error) {
        proxyStatus.innerHTML = `
            <div class="ip-status error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Fout bij VPN configuratie: ${error.message}</p>
            </div>`;
    }
}

// Reset maandelijkse teller op de eerste dag van elke maand
function resetMonthlyCounter() {
    const today = new Date();
    if (today.getDate() === 1) {
        vpnRequestsThisMonth = 0;
    }
}

// Check dagelijks voor reset
setInterval(resetMonthlyCounter, 24 * 60 * 60 * 1000); 