interface RuPlateProps {
  letters: string;
  digits: string;
  series: string;
  region: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: {
    main: 140,
    chars: 20,
    regionNum: 13,
    rus: 6,
    flag: 9,
    border: 2,
    pad: '3px 6px',
    regionPad: '2px 5px',
    minW: 32,
  },
  md: {
    main: 170,
    chars: 26,
    regionNum: 18,
    rus: 7,
    flag: 11,
    border: 2.5,
    pad: '4px 8px',
    regionPad: '2px 6px',
    minW: 40,
  },
  lg: {
    main: 200,
    chars: 31,
    regionNum: 21,
    rus: 8,
    flag: 13,
    border: 3,
    pad: '5px 10px',
    regionPad: '3px 7px',
    minW: 48,
  },
};

export function RuPlate({ letters, digits, series, region, size = 'md' }: RuPlateProps) {
  const s = sizes[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: 6,
        overflow: 'hidden',
        border: `${s.border}px solid #111`,
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: s.pad,
          background: '#fff',
          minWidth: s.main,
        }}
      >
        <span
          style={{
            fontFamily: "'Oswald',sans-serif",
            fontSize: s.chars,
            fontWeight: 700,
            color: '#111',
            letterSpacing: 2,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {letters}&nbsp;{digits}&nbsp;{series}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          borderLeft: '2px solid #111',
          padding: s.regionPad,
          minWidth: s.minW,
        }}
      >
        <div style={{ fontSize: s.flag, lineHeight: 1, marginBottom: 1 }}>🇷🇺</div>
        <div
          style={{
            fontFamily: "'Oswald',sans-serif",
            fontSize: s.regionNum,
            fontWeight: 700,
            color: '#111',
            lineHeight: 1.1,
          }}
        >
          {region}
        </div>
        <div
          style={{
            fontFamily: "'Nunito',sans-serif",
            fontSize: s.rus,
            fontWeight: 800,
            color: '#111',
            letterSpacing: 0.5,
            lineHeight: 1,
          }}
        >
          RUS
        </div>
      </div>
    </div>
  );
}
