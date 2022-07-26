const contactForm = document.getElementById("contact-form");
let fName = document.getElementById("fname");
let lName = document.getElementById("lname");
let email = document.getElementById("email");
let subject = document.getElementById("subject");
let message = document.getElementById("message");


contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let formData = {
        name: fName.value + " " + lName.value,
        email: email.value,
        subject: subject.value,
        message: message.value
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/contact");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.onload = () => {
        console.log(xhr.responseText);
        if(xhr.responseText == "success"){
            $("#result").html("Email Sent!").removeClass("contact-result").addClass( "contact-success" );
            name.value = "";
            email.value = "";
            subject.value = "";
            message.value = "";
        } else {
            $("#result").html("Email failed to send. Please try again.").removeClass("contact-result").addClass( "contact-error" );
        }
    }

    xhr.send(JSON.stringify(formData));
})