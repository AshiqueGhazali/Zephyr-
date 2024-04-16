// checking email
function validateEmail(email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(String(email).toLowerCase());
}

// checking password
function validatePassword(password) {
    const letterRegex = /[a-zA-Z]/;
    const digitRegex = /\d/;
    return password.length >= 6 && letterRegex.test(password) && digitRegex.test(password);
}

function checkPassword(event) {
    event.preventDefault();
  
    let password = document.getElementById("password").value.trim();
    let cnfm_password = document.getElementById("cnfm_password")
    let message = document.getElementById("message");
    let email = document.getElementById("email").value.trim();
    let firstName = document.getElementById("firstName").value.trim();
    let lastName = document.getElementById("lastName").value.trim();
    const nameRegex = /^[a-zA-Z]+$/;
  
    if (firstName.length === 0 || lastName.length === 0 || firstName.slice(-1)==='' ) {
        message.textContent = "Name cannot be empty.";
        message.style.color = "red";
        return;
    }
    
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        message.textContent = "Please enter a valid Name.";
        message.style.color = "red";
        return;
    }
  
    if (password.length === 0 || password[0] === " ") {
        message.textContent = "Please enter a valid Password";
        message.style.color = "red";
        return;
    }

    if (password != cnfm_password.value){
        message.textContent = "Conform password does not match";
        message.style.color = "red" ;
        return
    }
    // if (!validatePassword(password)) {
    //     message.textContent = "Password must be at least 6 characters long and contain at least one letter and one digit";
    //     message.style.color = "red";
    //     return; 
    // }
  
    if (!validateEmail(email)) {
        message.textContent = "Please enter a valid email address.";
        message.style.color = "red";
        return; 
    }
  
    console.log("Name, password, and email verified! Submitting form..."); 
    document.getElementById("signUpForm").submit();
}


// validation address
function addressValidation(event,  formId, messageId) {
    event.preventDefault();
  
    let Name = document.getElementById("name").value.trim();
    let Phone = document.getElementById("phone").value.trim();
    let Pincode = document.getElementById("pincode").value.trim();
    let locality = document.getElementById("locality").value.trim();
    let address = document.getElementById("address").value.trim();
    let city = document.getElementById("city").value.trim();
    let state = document.getElementById("state").value.trim();
    let message = document.getElementById(messageId);

    const nameRegex = /^[a-zA-Z]+$/;
    const phoneRegex = /^\d{10}$/; 
    const pincodeRegex = /^\d{6}$/;
  
    if (Name.length === 0 || Name.slice(-1)==='' ) {
        message.textContent = "Name cannot be empty.";
        message.style.color = "red";
        return;
    }
    
    if (!nameRegex.test(Name)) {
        message.textContent = "Please enter a valid Name.";
        message.style.color = "red";
        return;
    }
  
    if (!phoneRegex.test(Phone)) {
        message.textContent = "Please enter a valid Phone Number";
        message.style.color = "red";
        return;
    }

    if (!pincodeRegex.test(Pincode)) {
        message.textContent = "Please enter a valid PIN Address";
        message.style.color = "red";
        return;
    }

    
  
    document.getElementById(formId).submit();
}

