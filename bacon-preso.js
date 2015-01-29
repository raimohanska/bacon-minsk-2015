function keyUps(keyCode, modifiers) { 
  return $(document).asEventStream("keyup")
                    .filter(filterKeys(keyCode, modifiers)) 
}

function keyDowns(keyCode, modifiers) { 
  return $(document).asEventStream("keydown")
                    .filter(filterKeys(keyCode, modifiers)) 
}

function filterKeys(keyCode, modifiers) {
  var knownModifiers = ["alt", "shift", "meta"]
  return function(e) {
    return e.keyCode == keyCode && (!modifiers || _.all(knownModifiers, function(m) {
      var modifierActive = e[m + "Key"]
      var expectedActive = _.contains(modifiers, m)
      return modifierActive == expectedActive
    }))
  }
}

function keyState(keyCode, value) {
  return keyDowns(keyCode).map([value]).merge(keyUps(keyCode).map([])).toProperty([]).skipDuplicates()
}

function bubble(text) {
  text = (""+text).replace(" ", " ")
  var vmargin = $(window).height() * 0.1
  var vspace = $(window).height() - 100 - vmargin*2
  var fontSize = 5/(Math.pow(text.length, 1))
  var bubbleSize = text.length * 0.5
  var bubble = makeBubble(fontSize*2, bubbleSize*2, 10, 1.0, 1.0)
  makeBubble(fontSize*1.2, bubbleSize*1.2, -1, 0.4, 0.7)
  makeBubble(fontSize*0.7, bubbleSize*0.7, -1, 0.3, 0.5)
  return bubble
  function makeBubble(fs, bsize, zind, op, hscale) {
    var top = (typeof text == "string") 
      ? (text.charCodeAt(0) % 5) * vspace / 5 + vmargin
      : vmargin + Math.random()*vspace
    var bubble = $("<div>").text(text).addClass("bubble")
    var winWidth = $(window).width()
    var startX = (1-hscale)/2*winWidth - 100
    var endX = startX + (winWidth+100)*hscale
    bubble.css({
      opacity: op,
      "font-size": fs + "em",
      background: "linear-gradient(rgb(100, 169, 150), rgb(116, 133, 141))", color: "white",
      "border-radius": bsize/2 + "em", "z-index": zind,
      width:bsize+"em", height:bsize+"em", "line-height":bsize+"em",
      "text-align": "center",
      "text-transform": "uppercase", "font-family": "Helvetica, Arial, SansSerif",
      position:"fixed", top: top, 
      right: startX
    })
    $("body").append(bubble)
    bubble.css({transition: "right 5s linear, opacity 5s ease-in, transform 5s linear"})
    Bacon.later(0).onValue(function() {
        bubble.css({right: endX, opacity: 0, transform: "rotate(360deg)"})
    })
    bubble.asEventStream("webkitTransitionEnd")
      .onValue(function() { bubble.remove() })
    return bubble
  }
}

var show = function(text) {
  var delay = Math.random() * 2000
  setTimeout(function() { bubble(text) }, delay)
}

Bacon.Observable.prototype.show = function() {
  this.onValue(bubble)
  return this
}

Bacon.fromString = function(sting, delay) { 
  if (!delay) delay = 200
  var values = sting.split("")
  return Bacon.later(0, values[0])
   .concat(
     Bacon.sequentially(delay, values.slice(1))
   )
   .filter(function(x) { return x != "-" })
}

function runCode() {
  var code = $(".present code:visible")
  code.blur()
  try {
    eval(code.text())
  } catch (e) {
    alert(e)
  }
}

function setCode(code) {
  $(".present pre code").get(0).innerHTML = code
}

function getCode() {
  return $(".present pre code").get(0).innerHTML
}

function reloadCode() {
  localStorage.code = getCode()
  document.location.reload()
}

function revealCode() {
  localStorage.code =  $(".present endresult").get(0).innerHTML
  document.location.reload()
}

(function() {
  if (localStorage.code) {
    setCode(localStorage.code)
    delete localStorage.code
  }
})()

$("code.runnable").each(function() {
  var runLink = $("<a>").text("run")
    .addClass("runlink")
    .css({
      right: "0.3em",
      position: "absolute", cursor: "pointer"
    })
  $(this).parent().append(runLink)
  runLink.click(runCode)

  var reloadLink = $("<a>").text("reload")
    .addClass("runlink")
    .css({
      right: "2.3em",
      position: "absolute", cursor: "pointer"
    })
  reloadLink.click(reloadCode)
  $(this).parent().append(reloadLink)

  if ($(this).closest("section").find("endresult").length) {
    var revealLink = $("<a>").text("reveal")
      .addClass("runLink")
      .css({
        right: "6.0em",
        position: "absolute", cursor: "pointer"
      })
    revealLink.click(revealCode)
    $(this).parent().append(revealLink)
  }
  
})

keyUps(13, ["alt"]).doAction(".preventDefault").onValue(runCode)

emails = [
  "Hello raimo",
  "FREE DIAMONDS!!!",
  "You Won In The Lottery!!!",
  "Virus Alert!",
  "How to Attract Girls",
  "Your Password has Expired",
  "I love you",
  "Virus detected on your hard disk",
  "Free virus scanner",
  "Viagra 50% Discount NOW",
  "ENLARGE your *****",
  "SEX!",
].map(function(subject) { return { subject: subject } })

incomingEmailE = Bacon.repeatedly(500, emails)

function isSpam() { return false }
function isSpam2() { return true }

function showInbox(items) {
  var $inbox = $(".present .inbox")
  $inbox.addClass("visible")
  var $list = $inbox.find("ul")
  $list.children().remove()
  items.forEach(function(item) {
    $list.append($("<li>").text(item.subject))
  })
}
