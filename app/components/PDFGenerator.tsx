"use client";

import { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import type { UpholsteryOrder } from "../lib/supabase";

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 30,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    paddingBottom: 4,
    marginBottom: 8,
    borderBottom: "1px solid #cccccc",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottom: "1px solid #cccccc",
    paddingBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: "40%",
    fontSize: 10,
    fontWeight: "bold",
  },
  value: {
    width: "60%",
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
  },
});

// PDF Document component
const OrderPDF = ({ order }: { order: UpholsteryOrder }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Ideal Caravans Upholstery Order</Text>

      {/* Basic Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Basic Information</Text>
          <Text style={styles.value}>
            <Text style={{ fontWeight: "bold" }}>Order Placed: </Text>
            {new Date(order.orderDate).toLocaleDateString("en-GB")} @{" "}
            {new Date(order.orderDate).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Van Number:</Text>
          <Text style={styles.value}>LTRV - {order.vanNumber}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Model:</Text>
          <Text style={styles.value}>{order.model}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Brand of Sample:</Text>
          <Text style={styles.value}>{order.brandOfSample}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Color of Sample:</Text>
          <Text style={styles.value}>{order.colorOfSample}</Text>
        </View>
      </View>

      {/* Upholstery Options Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upholstery Options</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Bed Head:</Text>
          <Text style={styles.value}>{order.bedHead}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Arms:</Text>
          <Text style={styles.value}>{order.arms}</Text>
        </View>

        {order.base && (
          <View style={styles.row}>
            <Text style={styles.label}>Base:</Text>
            <Text style={styles.value}>{order.base}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Mag Pockets:</Text>
          <Text style={styles.value}>{order.magPockets}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Head Bumper:</Text>
          <Text style={styles.value}>
            {order.headBumper === "true" ? "1" : "None"}
          </Text>
        </View>

        {order.other && (
          <View style={styles.row}>
            <Text style={styles.label}>Other:</Text>
            <Text style={styles.value}>{order.other}</Text>
          </View>
        )}
      </View>

      {/* Specific Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specific Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Lounge Type:</Text>
          <Text style={styles.value}>{order.loungeType}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Design:</Text>
          <Text style={styles.value}>{order.design}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Curtain 760mm:</Text>
          <Text style={styles.value}>{order.curtain}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Stitching:</Text>
          <Text style={styles.value}>{order.stitching}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Bunk Mattresses:</Text>
          <Text style={styles.value}>{order.bunkMattresses}</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString("en-GB")}
      </Text>
    </Page>
  </Document>
);

interface PDFGeneratorProps {
  order: UpholsteryOrder;
}

export default function PDFGenerator({ order }: PDFGeneratorProps) {
  const [isClient, setIsClient] = useState(false);

  // React-PDF requires client-side rendering
  // This ensures the component only renders on the client
  // to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button
        disabled
        className="w-[180px] h-[40px] px-4 py-2 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
      >
        Preparing PDF...
      </button>
    );
  }

  return (
    <div>
      <PDFDownloadLink
        document={<OrderPDF order={order} />}
        fileName={`upholstery-order-${order.vanNumber}.pdf`}
        className="w-[180px] h-[40px] px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 inline-flex items-center justify-center whitespace-nowrap"
      >
        {({ loading }) => (loading ? "Generating PDF..." : "Download as PDF")}
      </PDFDownloadLink>
    </div>
  );
}
