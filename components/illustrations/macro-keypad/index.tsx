import geometry from "./geometry.json";
import KeypadLive from "./live";

export default function MacroKeypad() {
  return <KeypadLive
    base={<g key="keypad-base" dangerouslySetInnerHTML={{ __html: geometry.bed }} />}
    keys={geometry.keys.map(key => ({ id: key.id, label: key.label,
      socket: <g key={`socket-${key.id}`} dangerouslySetInnerHTML={{ __html: key.socket }} />,
      cap: <g key={`cap-${key.id}`} dangerouslySetInnerHTML={{ __html: key.cap }} />,
    }))}
    travel={geometry.travel}
    displayTransform={geometry.displayTransform}
    displayClip={geometry.displayClip}
  />;
}
