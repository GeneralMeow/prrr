import Prrrs from './Prrrs'
import cat from './images/favicon.ico'
import catHead from './images/favicon_head.ico'
import state from './state'


const loadCatImage = () => {
  let catHeadImage = document.createElement('img')
  catHeadImage.src = catHead
  return catHeadImage
  // catHeadImage.onload = loadCatImage
}


//let lastNumPendingPrrrs = 0
const updateNumFavicon = (numPendingPrrrs, secondsRemaining) => {
  //if (lastNumPendingPrrrs === numPendingPrrrs) return
  //lastNumPendingPrrrs = numPendingPrrrs


  // let catHeadImage = document.createElement('img')
  // catHeadImage.src = catHead
  loadCatImage((catHeadImage) => {
    catHeadImage.onload = () => {

      let canvas = document.createElement('canvas')
      canvas.width = 16
      canvas.height = 16

      let context = canvas.getContext('2d')

      context.drawImage(catHeadImage, 0, 0)
      context.fillStyle = "white";
    }
  })

    //change this psuedocode
    // if(currently reviewing a prrr){
    //   context.font = '12px sans-serif'
    //   context.fillText(time remaining to review prrr, 4.5, 13.5)
    // }
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



state.subscribe(state => {
  const prrrs = new Prrrs({
    currentUser: state.session.user,
    prrrs: state.prrrs,
  })

  const claimedPrrr = prrrs.claimed()
  if (claimedPrrr){
    // we have X time left for our claimed prrr
    let deadline = moment(claimedPrrr.claimed_at).add(1, 'hour')
    let secondsRemaining = deadline.diff(moment(), 'seconds')

    updateNumFavicon
    // TODO render the favicon
  }else{
    // we have prnding prrrs
    updateNumFavicon(prrrs.pending().length)
  }

})
