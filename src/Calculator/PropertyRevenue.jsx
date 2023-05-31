import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Drawer,
  SegmentedControl,
  Center,
  Text, 
  Tooltip
} from "@mantine/core";
import Papa from "papaparse";
import LoanExpense from "./LoanExpense";
import LoanExpensesTable from "./LoanExpensesTable";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SectionTitle from "../Shared/SectionTitle";
import { Calculator } from 'tabler-icons-react';

const PropertyRevenue = () => {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [loanExpenses, setLoanExpenses] = useState([]);
  const [isLoanExpenseVisible, setIsLoanExpenseVisible] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("table");
  const [propertyBalance, setPropertyBalance] = useState(0); // Added property balance state

  const handleMethodChange = (value) => {
    setSelectedMethod(value);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    parseCSV(uploadedFile);
  };

  const handleMapFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    parseMapData(uploadedFile);
  };

  useEffect(() => {
    const fetchMapData = async () => {
      const response = await fetch("data_zipcode.csv");
      const csvData = await response.text();
      const parsedData = Papa.parse(csvData, { header: true }).data;
      setMapData(parsedData);
    };

    fetchMapData();
  }, []);

  const parseCSV = (uploadedFile) => {
    Papa.parse(uploadedFile, {
      header: true,
      complete: (results) => {
        const processedData = results.data.map((row) => ({
          ...row,
          revenue: calculateRevenue(row.occupancy_rate, row.nightly_price),
          balance: 0,
        }));
        setData(processedData);
      },
    });
  };

  const parseMapData = (uploadedFile) => {
    Papa.parse(uploadedFile, {
      header: true,
      complete: (results) => {
        setProperties(results.data);
      },
    });
  };

  const calculateRevenue = (occupancyRate, nightlyPrice) =>
    occupancyRate * nightlyPrice * 30;


  const getLoanExpensesTotal = (zipcode, year, month) => {
    const expenses = loanExpenses.filter(
      (expense) =>
        expense.zipcode === zipcode &&
        expense.year === year &&
        expense.month === month
    );
    const expensesTotal = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
    return expensesTotal;
  };

  const updatePropertyBalance = (zipcode, year, month) => {
    const dataIndex = data.findIndex(
      (row) =>
        row.zipcode === zipcode && row.year === year && row.month === month
    );
    if (dataIndex !== -1) {
      const revenue = data[dataIndex].revenue;
      const expensesTotal = getLoanExpensesTotal(zipcode, year, month);
      const balance = revenue - expensesTotal;
      const newData = [...data];
      newData[dataIndex] = { ...newData[dataIndex], balance };
      setData(newData);
    }
  };

  const handleNavigate = (selectedObject) => {
    setSelectedObject(selectedObject);
    setIsDrawerOpen(true);
  };

  const addLoanExpense = (type, loanDetails) => {
    const { amount } = loanDetails;
    setLoanExpenses([...loanExpenses, { type, ...loanDetails }]);
    setIsLoanExpenseVisible(true);
    setPropertyBalance(propertyBalance + amount); 
  };
  
  const markerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    iconUrl: "marker-icon.png",
    shadowUrl: "marker-shadow.png",
  });

  useEffect(() => {
    const calculateTotalBalance = () => {
      const balanceSum = data.reduce(
        (total, row) => total + row.balance,
        0
      );
      setPropertyBalance(balanceSum);
    };
    calculateTotalBalance();
  }, [data]);

  useEffect(() => {
    if (selectedObject) {
      updatePropertyBalance(
        selectedObject.zipcode,
        selectedObject.year,
        selectedObject.month
      );
    }
  }, [loanExpenses]);

  return (
    <Container size="xl">
      <SectionTitle>Investors Calculator</SectionTitle>
      <Center>
        <SegmentedControl
          value={selectedMethod}
          onChange={handleMethodChange}
          data={[
            { value: "table", label: "Table" },
            { value: "map", label: "Map" },
          ]}
        />
      </Center>
      {selectedMethod === "table" ? (
        <Center>
          <label htmlFor="fileInput" style={{ marginTop: "1rem" }}>
            Upload CSV File
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              required
              style={{ display: "none" }}
            />
          </label>
        </Center>
      ) : (
        <Center>
  <label htmlFor="mapFileInput" style={{ marginTop: "1rem" }}>
    Upload Map CSV File
    <input
      id="mapFileInput"
      type="file"
      accept=".csv"
      onChange={handleMapFileUpload}
      required
      style={{ display: "none" }}
    />
  </label>
</Center>
      )}

      {properties.length > 0 && (
        <div>
  <SectionTitle>Map</SectionTitle>

          <MapContainer
            style={{ height: "400px", width: "100%" }}
            center={[51.505, -0.09]}
            zoom={13}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {properties.map(({ property_id, zip_code }) => (
              <Marker
                key={property_id}
                position={[parseFloat(zip_code), parseFloat(zip_code)]}
                icon={markerIcon}
              />
            ))}
          </MapContainer>
        </div>
      )}

      {file && (
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
                    ${calculateRevenue(occupancy_rate, nightly_price).toFixed(
                      2
                    )}
                  </td>
                  <td>
                    <Calculator
                      onClick={() =>
                        handleNavigate({
                          zipcode,
                          year,
                          month,
                          occupancy_rate,
                          nightly_price,
                        })
                      }
                      size={38}
                      strokeWidth={2}
                      color={"#5840bf"}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      )}

      <Drawer
        position="right"
        size="xl"
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Container size="sm">
          {selectedObject && (
            <div>
              <SectionTitle>Selected Estate</SectionTitle>
              <Text variant="gradient" gradient={{ from: "indigo", to: "cyan", deg: 65 }} ta="center" fz="xl" fw={700}>
                Zipcode: {selectedObject.zipcode}
              </Text>
              <Text c="blue" ta="center">Year: {selectedObject.year}</Text>
              <Text c="blue" ta="center">Month: {selectedObject.month}</Text>
              <Text variant="gradient" gradient={{ from: "indigo", to: "cyan", deg: 65 }} ta="center" fz="xl" fw={700}>
                Revenue: $
                {calculateRevenue(
                  selectedObject.occupancy_rate,
                  selectedObject.nightly_price
                ).toFixed(2)}
              </Text>
            </div>
          )}

          {!isLoanExpenseVisible && (
            <Button ta="center" onClick={() => setIsLoanExpenseVisible(true)}>
              Add Loan
            </Button>
          )}

          {isLoanExpenseVisible && (
            <LoanExpense addLoanExpense={addLoanExpense} />
          )}

          {loanExpenses.length > 0 && (
            <>
              <SectionTitle>Loan Expenses</SectionTitle>
              <LoanExpensesTable loanExpenses={loanExpenses} />
            </>
          )}

          {isLoanExpenseVisible && (
            <Center style={{ marginTop: "2rem" }}>
            <Text size="xl" weight={500}>
              Property Balance: ${(propertyBalance + loanExpenses.reduce((total, expense) => total + expense.amount, 0)).toFixed(2)}
            </Text>
          </Center>
          )}
        </Container>
      </Drawer>
    </Container>
  );
};

export default PropertyRevenue;
