const contactForm = document.getElementById("contact-form");
const fName = document.getElementById("fname");
const lName = document.getElementById("lname");
const email = document.getElementById("email");
const subject = document.getElementById("subject");
const message = document.getElementById("message");


contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    name: fName.value + " " + lName.value,
    email: email.value,
    subject: subject.value,
    message: message.value,
  };

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/contact");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.onload = () => {
    console.log(xhr.responseText);
    if (xhr.responseText == "success") {
      $("#result")
          .html("Email Sent!")
          .removeClass("contact-result")
          .addClass( "contact-success" );
      fName.value = "";
      lName.value = "";
      email.value = "";
      subject.value = "";
      message.value = "";
    } else {
      $("#result")
          .html("Email failed to send. Please try again.")
          .removeClass("contact-result").addClass( "contact-error" );
    }
  };

  xhr.send(JSON.stringify(formData));
});
