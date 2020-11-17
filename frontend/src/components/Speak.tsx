import React from 'react';
import { serverURL } from '../config';


interface SpeakProps {
    text: string
}

export class Speak extends React.Component<SpeakProps> {
    constructor(props: SpeakProps) {
        super(props);
        this.audioRef = React.createRef();
    }

    audioRef: React.RefObject<HTMLAudioElement>;

    render() {
        return (
            <div className="App">
                {/* <p>{this.props.text}</p> */}
                <audio autoPlay id="audio"
                    src={`${serverURL}/api/v1/synthesize?text=${this.props.text}&voice=en-US_AllisonV3Voice&accept=audio/mp3`}
                    // controls={true}
                    ref={this.audioRef}>
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
    }
}

export default Speak;
