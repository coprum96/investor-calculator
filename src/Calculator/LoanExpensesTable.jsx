import React from "react";
import { Table } from "@mantine/core";

const LoanExpensesTable = ({ loanExpenses }) => {
  return (
    <Table striped>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Duration</th>
          <th>Start</th>
        </tr>
      </thead>
      <tbody>
        {loanExpenses.map((loan, index) => (
          <tr key={index}>
            <td>{loan.type}</td>
            <td>{loan.amount}</td>
            <td>{loan.duration}</td>
            <td>{loan.start.toString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default LoanExpensesTable;
