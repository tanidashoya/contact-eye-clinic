"use client";
//このコンポーネントは入力値を最初はstring型として、空白での0表示を防ぎつつ、フォーカスが外れたら値を更新してNumber型に変換する。
import { useState, useEffect } from "react";
import { Input } from "./ui/input";

interface NumberInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  numberValue: number;
  onValueChange: (value: number) => void;
}

export default function NumberInput({
  numberValue,
  onValueChange,
  ...props
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(String(numberValue));

  // 外部のnumberValueが変わったらローカルも同期
  useEffect(() => {
    setLocalValue(String(numberValue));
  }, [numberValue]);

  // 入力中は文字列のまま保持（空文字もOK）
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  // フォーカスが外れたら値を更新
  const handleBlur = () => {
    const trimmed = localValue.trim();
    if (trimmed === "" || isNaN(Number(trimmed))) {
      // 空白または無効な値の場合、前回の値に戻す
      setLocalValue(String(numberValue));
    } else {
      // 外部のonValueChangeを呼び出す。ここでnumberValueの値が更新される。
      onValueChange(Number(trimmed));
    }
  };

  return (
    <Input
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
