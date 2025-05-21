"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useState } from "react";
import Chart from "react-apexcharts";

const GmailTrackingPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[string, string]>([
    "2024-05-01",
    "2024-05-11",
  ]);

  // Dữ liệu mẫu cho biểu đồ
  const chartOptions = {
    chart: { id: "gmail-tracking" },
    xaxis: { categories: ["01/05", "02/05", "03/05", "04/05", "05/05"] },
  };
  const chartSeries = [
    { name: "Đã gửi", data: [20, 30, 25, 40, 35] },
    { name: "Đã mở", data: [10, 18, 15, 22, 20] },
    { name: "Đã trả lời", data: [2, 5, 3, 7, 4] },
  ];

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <Breadcrumb pageName="Gmail Tracking Statistics" />

        {/* Bộ lọc thời gian */}
        <div className="mb-6 flex gap-4">
          <label className="font-medium">Khoảng thời gian:</label>
          <input
            type="date"
            value={dateRange[0]}
            onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
          />
          <span>-</span>
          <input
            type="date"
            value={dateRange[1]}
            onChange={(e) => setDateRange([dateRange[0], e.target.value])}
          />
        </div>

        {/* Các chỉ số tổng quan */}
        <div className="mb-8 grid grid-cols-3 gap-6">
          <div className="rounded bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Tổng email đã gửi</div>
            <div className="text-2xl font-bold">150</div>
          </div>
          <div className="rounded bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Tổng email đã mở</div>
            <div className="text-2xl font-bold">85</div>
          </div>
          <div className="rounded bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Tỷ lệ mở</div>
            <div className="text-2xl font-bold">56.7%</div>
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="mb-8 rounded bg-white p-4 shadow">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={300}
          />
        </div>

        {/* Bảng chi tiết */}
        <div className="rounded bg-white p-4 shadow">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th>Email</th>
                <th>Thời gian gửi</th>
                <th>Đã mở</th>
                <th>Thời gian mở</th>
                <th>Đã trả lời</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>user1@gmail.com</td>
                <td>01/05/2024 09:00</td>
                <td>Có</td>
                <td>01/05/2024 09:10</td>
                <td>Không</td>
              </tr>
              {/* ...dòng khác */}
            </tbody>
          </table>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default GmailTrackingPage;
