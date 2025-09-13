import React from "react";
import { useTheme } from "../context/ThemeContext";
import styled from "styled-components";

const ToggelSwitch = () => {
  const { theme, setTheme } = useTheme();
  const handleThemeChange = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <StyledWrapper>
      <label className="switch">
        <input type="checkbox" onChange={handleThemeChange} checked={theme === "dark"} />
        <span className="slider">
          <span className="icon sun" />
          <span className="icon moon" />
        </span>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Switch container */
  .switch {
    --width-of-switch: 3.5em;
    --height-of-switch: 2em;
    --size-of-icon: 1.4em;
    --slider-offset: 0.3em;

    position: relative;
    display: inline-block;
    width: var(--width-of-switch);
    height: var(--height-of-switch);
  }

  /* Hide default checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* Slider background */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f4f4f5;
    transition: background 0.4s;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--slider-offset);
  }

  /* Circular icon (sun or moon) */
  .slider::before {
    content: "";
    height: var(--size-of-icon);
    width: var(--size-of-icon);
    border-radius: 50%;
    background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
    position: absolute;
    left: var(--slider-offset);
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.4s ease;
  }

  /* Checked state ➝ dark mode */
  input:checked + .slider {
    background: #303136;
  }

  input:checked + .slider::before {
    left: calc(100% - (var(--size-of-icon) + var(--slider-offset)));
    background: #303136;
    box-shadow: inset -3px -2px 5px -2px #8983f7,
      inset -10px -4px 0 0 #a3dafb;
  }
`;

export default ToggelSwitch;
