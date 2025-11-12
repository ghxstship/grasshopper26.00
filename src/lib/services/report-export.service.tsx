/**
 * Report Export Service
 * PDF, Excel, CSV generation for KPI reports
 */

import type { GeneratedReport } from '@/types/kpi';
import * as XLSX from 'xlsx';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import React from 'react';

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
});

export class ReportExportService {
  async exportToPDF(report: GeneratedReport): Promise<Blob> {
    const metricsData = this.prepareMetricsData(report);
    const summaryData = this.prepareSummaryData(report);

    // Create PDF document
    const PDFDocument = () => (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <View style={pdfStyles.header}>
            <Text>{report.report_name}</Text>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Report Summary</Text>
            {summaryData.map((item, index) => (
              <View key={index} style={pdfStyles.row}>
                <Text style={pdfStyles.label}>{Object.keys(item)[0]}:</Text>
                <Text style={pdfStyles.value}>{Object.values(item)[0]}</Text>
              </View>
            ))}
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Metrics</Text>
            <View style={pdfStyles.table}>
              <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                <Text style={pdfStyles.tableCell}>Metric</Text>
                <Text style={pdfStyles.tableCell}>Current</Text>
                <Text style={pdfStyles.tableCell}>Target</Text>
                <Text style={pdfStyles.tableCell}>Trend</Text>
              </View>
              {metricsData.map((metric, index) => (
                <View key={index} style={pdfStyles.tableRow}>
                  <Text style={pdfStyles.tableCell}>{metric['Metric Name']}</Text>
                  <Text style={pdfStyles.tableCell}>{metric['Current Value']}</Text>
                  <Text style={pdfStyles.tableCell}>{metric['Target Value']}</Text>
                  <Text style={pdfStyles.tableCell}>{metric['Trend']}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={pdfStyles.section}>
            <Text>Generated: {new Date(report.generated_at).toLocaleString()}</Text>
          </View>
        </Page>
      </Document>
    );

    // Generate PDF blob
    const blob = await pdf(<PDFDocument />).toBlob();
    return blob;
  }

  async exportToExcel(report: GeneratedReport): Promise<Blob> {
    const metricsData = this.prepareMetricsData(report);
    const summaryData = this.prepareSummaryData(report);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add summary sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Add metrics sheet
    const metricsSheet = XLSX.utils.json_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  async exportToCSV(report: GeneratedReport): Promise<Blob> {
    const metricsData = this.prepareMetricsData(report);
    
    // Create CSV with headers
    const headers = Object.keys(metricsData[0] || {});
    const csvRows = [
      headers.join(','), // Header row
      ...metricsData.map(row => 
        headers.map(header => {
          const value = (row as any)[header];
          // Escape values containing commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];
    
    const csv = csvRows.join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }


  private prepareMetricsData(report: GeneratedReport) {
    const metrics = report.report_data.metrics || [];
    return metrics.map(m => ({
      'Metric Name': m.metric_name,
      'Current Value': m.current_value,
      'Target Value': m.target_value || 'N/A',
      'Trend': m.trend,
      'Change %': m.percentage_change || 0,
      'Unit': m.unit,
    }));
  }

  private prepareSummaryData(report: GeneratedReport) {
    const summary = report.report_data.summary;
    return [{
      'Total Revenue': summary?.total_revenue || 0,
      'Total Attendees': summary?.total_attendees || 0,
      'Profit Margin': summary?.profit_margin || 0,
      'Generated At': report.generated_at,
    }];
  }
}

export const reportExportService = new ReportExportService();
