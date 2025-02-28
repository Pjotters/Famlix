function verifyAge() {
    const day = parseInt(document.getElementById('day').value);
    const month = parseInt(document.getElementById('month').value);
    const year = parseInt(document.getElementById('year').value);
    const resultDiv = document.getElementById('verify-result');

    if (!day || !month || !year) {
        resultDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                Vul alle velden in
            </div>`;
        resultDiv.className = 'verify-result error';
        return;
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age >= 18) {
        localStorage.setItem('ageVerified', 'true');
        resultDiv.innerHTML = `
            <div class="success">
                <i class="fas fa-check-circle"></i>
                Verificatie succesvol! Je wordt doorgestuurd...
            </div>`;
        resultDiv.className = 'verify-result success';
        setTimeout(() => {
            window.location.href = localStorage.getItem('redirectUrl') || 'index.html';
        }, 2000);
    } else {
        resultDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                Je moet 18 jaar of ouder zijn om toegang te krijgen
            </div>`;
        resultDiv.className = 'verify-result error';
    }
}

// Voeg deze functie toe aan elke pagina die leeftijdsverificatie vereist
function checkAge(redirectUrl) {
    if (!localStorage.getItem('ageVerified')) {
        localStorage.setItem('redirectUrl', redirectUrl);
        window.location.href = 'adult-verify.html';
        return false;
    }
    return true;
} 