import Prrrs from './Prrrs'
import cat from './images/favicon.ico'
import catHead from './images/favicon_head.ico'
import state from './state'

let lastNumPendingPrrrs = 0
const updateNumFavicon = (numPendingPrrrs) => {
  if (lastNumPendingPrrrs === numPendingPrrrs) return
  lastNumPendingPrrrs = numPendingPrrrs
  if (numPendingPrrrs === 0) {
    const linkEl = document.getElementsByClassName('favicon')[0]
    linkEl.href = cat
  } else {
    let canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16

    let context = canvas.getContext('2d')

    let catHeadImage = document.createElement('img')
    catHeadImage.src = catHead

    catHeadImage.onload = () => {
      context.drawImage(catHeadImage, 0, 0)
      context.fillStyle = "white";
      if ( numPendingPrrrs < 10 ) {
        context.font = '12px sans-serif'
        context.fillText(numPendingPrrrs, 4.5, 13.5)
      } else if ( numPendingPrrrs < 100 ) {
        context.font = '10px sans-serif'
        context.fillText(numPendingPrrrs, 2.5, 13)
      } else {
        context.font = '8px sans-serif'
        context.fillText(numPendingPrrrs, 1.25, 12)
      }

      const linkEl = document.getElementsByClassName('favicon')[0]
      linkEl.href = context.canvas.toDataURL()
    }
  }
}

state.subscribe(state => {
  const prrrs = new Prrrs({
    currentUser: state.session.user,
    prrrs: state.prrrs,
  })

  updateNumFavicon(prrrs.pending().length)
})
