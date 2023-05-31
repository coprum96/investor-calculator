import React, { useState } from "react";
import { Button, SegmentedControl, TextInput, Center } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import SectionTitle from "../Shared/SectionTitle";

const LoanExpense = ({ addLoanExpense }) => {
  const [loanType, setLoanType] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [loanStartTime, setLoanStartTime] = useState("");
  const [loanRate, setLoanRate] = useState("");

  const handleLoanSubmit = (event) => {
    event.preventDefault();
  
    if (loanType === "normal") {
      const amountPerMonth = loanAmount / loanDuration;
      for (let i = 0; i < loanDuration; i++) {
        const loanDetails = {
          amount: amountPerMonth,
          duration: 1,
          start: formatDate(loanStartTime),
          paymentAmount: amountPerMonth, 
        };
        addLoanExpense("normal", loanDetails);
        loanStartTime.setMonth(loanStartTime.getMonth() + 1);
      }
    } else if (loanType === "spitzer") {
      const yearlyPayment = PMT(loanRate, loanDuration, -loanAmount);
      const monthlyPayment = yearlyPayment / 12;
      for (let i = 0; i < loanDuration; i++) {
        const loanDetails = {
          amount: monthlyPayment,
          duration: 1,
          start: formatDate(loanStartTime),
          paymentAmount: monthlyPayment, 
        };
        addLoanExpense("spitzer", loanDetails);
        loanStartTime.setMonth(loanStartTime.getMonth() + 1);
      }
    }
  
    setLoanType("");
    setLoanAmount("");
    setLoanDuration("");
    setLoanStartTime("");
    setLoanRate("");
  };
  
  
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}.${month}.${year}`;
  };

  const PMT = (rate, nper, pv) => {
    const pvif = Math.pow(1 + rate, nper);
    return (-pv * rate * pvif) / (pvif - 1);
  };

  const loanTypes = [
    { value: "normal", label: "Normal Loan" },
    { value: "spitzer", label: "Spitzer Mortgage" },
  ];

  return (
    <div>
      <SectionTitle>Add Loan Expense</SectionTitle>
      <SegmentedControl
        value={loanType}
        onChange={setLoanType}
        data={loanTypes}
        required
      />

      {loanType === "spitzer" && (
        <TextInput
          type="number"
          value={loanRate}
          onChange={(event) => setLoanRate(event.target.value)}
          placeholder="Loan Rate"
          required
        />
      )}

      <TextInput
        type="number"
        value={loanAmount}
        onChange={(event) => setLoanAmount(event.target.value)}
        placeholder="Loan Amount"
        required
      />

      <TextInput
        type="number"
        value={loanDuration}
        onChange={(event) => setLoanDuration(event.target.value)}
        placeholder="Loan Duration"
        required
      />
      <Center>
        <DatePicker
          defaultLevel="decade"
          value={loanStartTime}
          onChange={(value) => {
            const date = new Date(value);
            if (!isNaN(date)) {
              setLoanStartTime(date);
            }
          }}
          required
        />
      </Center>
      <Button onClick={handleLoanSubmit}>Add Loan Expense</Button>
    </div>
  );
};

export default LoanExpense;
