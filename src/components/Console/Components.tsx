import styled from 'styled-components'

export const Wrapper = styled.div`
  display: block;
  margin: 0 auto;
  height: 150px;
  background-color: #000;
  border-radius: 5px;
  position: relative;
`

export const Scroller = styled.div`
  height: 150px;
  padding: 10px;
  width: 100%;
  display: block;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0.5em;
  }

  &::-webkit-scrollbar-track {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #33ff33;
    border-radius: 5px;
  }
`

export const ConsoleLine = styled.pre`
  font-family: 'Inconsolata', monospace;
  color: #33ff33;
  margin: 0;
  white-space: pre-wrap;
`

export const ConsoleLineError = styled(ConsoleLine)`
  color: #ff3333;
`

export const ConsoleLineWarning = styled(ConsoleLine)`
  color: #ffff33;
`

export const ConsoleLineInfo = styled(ConsoleLine)`
  color: #33ffff;
`

export const ConsoleCursor = styled.div`
  background-color: #33ff33;
  width: 0.5em;
  height: 1em;
`
