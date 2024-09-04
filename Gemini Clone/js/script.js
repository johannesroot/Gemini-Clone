const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const seggestion = document.querySelectorAll(".suggestion-list .seggestion");
const toggleButton = document.querySelector("#toggle-button");
const deleteButton = document.querySelector("#delete-button");
 
let userMessage = null; 

let isResponseGenerating = false;
// API
const API_KEY = `AIzaSyC0xOGLDNDwUswJt1Amn6he9fTri4xDFA8`;
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}` ;


const onLoadTheme = () => {
    const savedChat = localStorage.getItem("savedChat")
    const isLight = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode", isLight);
    toggleButton.innerText = isLight ? "dark_mode" : "light_mode";

    chatList.innerHTML =  savedChat || "";
    document.body.classList.toggle("hide-header", savedChat);
   
}
onLoadTheme();

const createMeassage = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content ;
    return div;
}

const showTypingEffect = (text, textElement, loadingMessageDiv) => {
    const words = text.split(' ');
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentIndex === 0 ? '' : ' ') + words[currentIndex++];
        loadingMessageDiv.querySelector(".icon").classList.add("hide");

        
    if(currentIndex === words.length){
        clearInterval(typingInterval);
        isResponseGenerating = false;
        loadingMessageDiv.querySelector(".icon").classList.remove("hide");

        localStorage.setItem("savedChat", chatList.innerHTML);
          }
    }, 75);


}

const generateAPIResponse = async (loadingMessageDiv) => {

    const textElement = loadingMessageDiv.querySelector(".text");

    try{
        const response = await fetch(API_URL,{
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage}]
                }]
            })
        });

        const data = await response.json();

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        // textElement.innerText = apiResponse ; // this displays the whole text once 
         showTypingEffect(apiResponse, textElement, loadingMessageDiv);
      }catch (err){
        isResponseGenerating = false;
        console.log(err);
    }finally {
        loadingMessageDiv.classList.remove("loading");
    }
}

const showLoadingAnimation = () => {
    
    const loadingHtml = `<div class="message-content">
                <img src="./images/gemini.svg" alt="Gemini image" class="avater">
                <p class="text"> </p>

                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                 </div>
            </div>
        <span onclick = "copyMessage(this)" class="icon material-symbols-rounded"> content_copy </span>
`;

            const loadingMessageDiv = createMeassage(loadingHtml, "incoming", "loading");
            chatList.appendChild(loadingMessageDiv);


            generateAPIResponse(loadingMessageDiv);
}

const copyMessage = (copyIcon) => {
    const message = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(message);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;

    if(!userMessage || isResponseGenerating) return; //return if no message.

    isResponseGenerating = true ;

    const html = ` <div class="message-content">
                <img src="./images/gemini.png" alt="User image john" class="avater">
                <p class="text"> </p>
            </div>`;

           const outGoingMessageDiv = createMeassage(html, "outgoing");
           outGoingMessageDiv.querySelector(".text").innerText = userMessage ;
           chatList.appendChild(outGoingMessageDiv);

           typingForm.reset(); // clear input
           document.body.classList.add("hide-header");
           setTimeout(showLoadingAnimation, 500);

}



seggestion.forEach(seggestion => {
    seggestion.addEventListener("click", () => {
        userMessage = seggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});






toggleButton.addEventListener("click", () => {
   const darkOr = document.body.classList.toggle("light_mode");
   localStorage.setItem("themeColor",  darkOr ? "light_mode" : "dark_mode");
   toggleButton.innerText = darkOr ? "dark_mode" : "light_mode";
})

deleteButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all messages?")){
        localStorage.removeItem("savedChat");
        onLoadTheme();
    }
})
  
typingForm.addEventListener("submit", (e)=> {
    e.preventDefault();

    handleOutgoingChat();
})


