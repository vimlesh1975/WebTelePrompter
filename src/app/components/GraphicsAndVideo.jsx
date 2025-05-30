import React, { useEffect, useState } from 'react'

const GraphicsAndVideo = ({ scriptID, slugs, currentStoryNumber,content , currentSlug}) => {
  const [useAutoPlay, setuseAutoPlay] = useState(false)
  const [videoChannel2, setVideoChannel2] = useState(false)
  const endpoint = async (str) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type as JSON
      },
      body: JSON.stringify(str), // Convert the data to JSON format
    };
    fetch("/api/casparcg", requestOptions);
  };

  useEffect(() => {
    if (useAutoPlay) {
      sendGraphics();
    }
  }, [currentStoryNumber])

  const sendGraphics = () => {

    endpoint({
      action: "endpoint",
      command: `play ${videoChannel2?2:1}-1 tr wipe 10 left`,
    });

    endpoint({
      action: "endpoint",
      command: `mixer ${videoChannel2?2:1}-1 fill 0.238487 0.049438 0.710526 0.705618`,
    });

    endpoint({
      action: "endpoint",
      command: `stop ${videoChannel2?2:1}-96`,
    });
    setTimeout(() => {
      endpoint({
        action: "endpoint",
        command: `play ${videoChannel2?2:1}-1 "newsmediac1/${slugs[currentStoryNumber - 1]?.Media}" loop wipe 10 left`,
      });
      var data = (slugs[currentStoryNumber - 1]?.OneLinerText)?.split("\n")
      if(!data){
        data=['']
      }
        let xml = '';
        xml += `<componentData id=\\"${'ccg_f0'}\\"><data id=\\"text\\" value=\\"${data[0] ?? ''}\\" /></componentData>`
        xml += `<componentData id=\\"${'ccg_f1'}\\"><data id=\\"text\\" value=\\"${currentStoryNumber ?? ''}\\" /></componentData>`
        xml = `"<templateData>${xml}</templateData>"`
        const templateName = 'tp/oneliner2';
        endpoint({
          action: "endpoint",
          command: `cg ${videoChannel2?2:1}-96 add 96 "${templateName}" 1 ${xml}`
        });
    }, 400);
  }

  const stopGraphics = () => {
    endpoint({
      action: "endpoint",
      command: `stop ${1}-96`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${1}-1`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${1}-0`,
    });



    endpoint({
      action: "endpoint",
      command: `stop ${2}-96`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${2}-1`,
    });
    endpoint({
      action: "endpoint",
      command: `stop ${2}-0`,
    });
  }

  const sendGraphcsNews=()=>{
    let xml = '';
    xml += `<componentData id=\\"${'f0'}\\"><data id=\\"text\\" value=\\"${slugs[currentSlug]?.SlugName}\\" /></componentData>`
    xml += `<componentData id=\\"${'f1'}\\"><data id=\\"text\\" value=\\"${content}\\" /></componentData>`
    xml = `"<templateData>${xml}</templateData>"`
    const templateName = 'tp/graphics_news';
    endpoint({
      action: "endpoint",
      command: `cg ${videoChannel2?2:1}-96 add 96 "${templateName}" 1 ${xml}`
    });
  }

  const playScroll=()=>{
    const templateName = 'tp/scroll/1920_1080';
    endpoint({
      action: "endpoint",
      command: `stop ${videoChannel2?2:1}-96 `
    });
    endpoint({
      action: "endpoint",
      command: `cg ${videoChannel2?2:1}-96 add 96 "${templateName}" 1 `
    });

    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 "_speed=300" `
    });
    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 "_ltr=false" `
    });
    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 "messages=['${content}']" `
    });
    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 "putImage=false"`
    });
    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 window.start()`
    });

  }
  const updateScroll=()=>{
    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 "clearAndRestartTicker()" `
    });

    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 "messages=['${content}']" `
    });

    endpoint({
      action: "endpoint",
      command: `call ${videoChannel2?2:1}-96 window.start()`
    });
  }

  useEffect(() => {
    updateScroll()
  }, [content])
  
  

  return (
    <div>
      <p>Graphics And Video</p>
      <label>
              {" "}
              <input
                checked={useAutoPlay}
                type="checkbox"
                onChange={() => setuseAutoPlay(val => !val)}
              />{" "}
              <span>Auto Play on Next</span>
            </label>

            <label>
              {" "}
              <input
                checked={videoChannel2}
                type="checkbox"
                onChange={() => {
                  setVideoChannel2(val => !val);
                  endpoint({
                    action: "endpoint",
                    command: `play ${videoChannel2?2:1}-0 express_loop loop`,
                  });
                }}
              />{" "}
              <span>Video on 2nd Channel</span>
            </label>
      {(slugs[currentStoryNumber - 1]?.OneLinerText)?.split("\n").map((val, i) => <div key={i}>Line {i + 1} {val}</div>)}
      <div>
        Video File: {scriptID}{slugs[currentStoryNumber - 1]?.Media}
        <div>
          <button onClick={sendGraphics}>Play</button>
          <button onClick={stopGraphics}>Stop</button>
        </div>
        <div>
        <p>Graphics news</p>
        <button onClick={sendGraphcsNews}>Play Graphics news</button>
        <button onClick={playScroll}>Play Scroll</button>
        <button onClick={updateScroll}>Update Scroll</button>
        </div>
      </div>
    </div>
  )
}

export default GraphicsAndVideo
