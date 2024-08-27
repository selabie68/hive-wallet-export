import { useEffect, useRef } from 'react'
import { Typography } from 'antd'

import { Wrapper, ConsoleLine, ConsoleCursor, Scroller } from './Components'

interface ConsoleProps {
  style: React.CSSProperties
  logs: string[]
}

function Console({ style, logs }: ConsoleProps) {
  const consoleScroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (consoleScroller.current) {
      consoleScroller.current.scrollTop = consoleScroller.current.scrollHeight
    }
  }, [logs])

  return (
    <Wrapper style={style}>
      <Scroller ref={consoleScroller}>
        {logs.map((log, index) => (
          <ConsoleLine key={index}>
            {Array.isArray(log)
              ? log.map((cont, key) => (
                  <Typography.Text
                    style={{ marginRight: 5 }}
                    key={`inner-${key}`}
                  >
                    {cont}
                  </Typography.Text>
                ))
              : log}
          </ConsoleLine>
        ))}
        <ConsoleLine>
          <ConsoleCursor />
        </ConsoleLine>
      </Scroller>
    </Wrapper>
  )
}

export default Console
