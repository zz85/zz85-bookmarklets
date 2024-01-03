// select a video and save the current
// frame as an image like a screenshot
// by rendering to via a canvas element
(() => {
v = document.querySelectorAll('video')[0]
c = document.createElement('canvas')
c.width = v.videoWidth
c.height = v.videoHeight
ctx = c.getContext('2d')
ctx.drawImage(v, 0, 0)
i = c.toDataURL()
a = document.createElement('a')
a.download = 'video_screenshot.png'
a.href = i
a.click()
})()
