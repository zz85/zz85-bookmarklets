/**
 * idea from @thespite on how a drunk sounds
 * https://twitter.com/thespite/status/1056264007450062848
 */

u = () => {
    requestAnimationFrame(u)
    ;[...document.querySelectorAll('video')].map(e => {
        e.playbackRate = Math.sin(Date.now() * 0.004) * 0.2 + 0.6
    })
}

u()