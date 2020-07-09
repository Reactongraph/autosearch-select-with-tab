import React from "react";

const InputContainer = ({
  onKeyPress,
  id,
  type,
  name,
  value,
  onChange,
  className,
  placeholder,
  maxLength,
  disable,
  min,
  onKeyDown
}) => (
  <input
    id={id ? id : ""}
    type={type ? type : "text"}
    name={name}
    min={type ? (type === "number" ? min : "") : ""}
    value={value}
    className={className}
    onChange={onChange}
    placeholder={placeholder}
    maxLength={maxLength ? maxLength : 100000}
    disabled={disable ? disable : false}
    onKeyPress={onKeyPress ? onKeyPress : null}
    onKeyDown={onKeyDown ? onKeyDown : null}
  />
);

export default InputContainer;
