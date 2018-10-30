(() => {
    const text = window.getSelection().toString()
    const s = new SpeechSynthesisUtterance(text)
    console.log('reading text: ' + text)
    speechSynthesis.speak(s)
})();

