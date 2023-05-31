import React from "react";
import { Table } from "@mantine/core";
import CalculatorIcon from "./CalculatorIcon";

const PropertyTable = ({ data, calculateRevenue, handleNavigate }) => {
  return (
    <Table
      striped
      highlightOnHover
      withBorder
      withColumnBorders
      horizontalSpacing="xl"
      verticalSpacing="sm"
    >
      <thead>
        <tr>
          <th>Zipcode</th>
          <th>Year</th>
          <th>Month</th>
          <th>Revenue</th>
          <th>Loan Expense</th>
        </tr>
      </thead>
      <tbody>
        {data.map(
          (
            { zipcode, year, month, nightly_price, occupancy_rate },
            index
          ) => (
            <tr key={`${zipcode}-${year}-${month}-${index}`}>
              <td>{zipcode}</td>
              <td>{year}</td>
              <td>{month}</td>
              <td>
                ${calculateRevenue(occupancy_rate, nightly_price).toFixed(2)}
              </td>
              <td>
                <CalculatorIcon />
              </td>
            </tr>
          )
        )}
      </tbody>
    </Table>
  );
};

export default PropertyTable;
