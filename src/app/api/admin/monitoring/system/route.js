// app/api/admin/monitoring/system/route.js - Métricas del sistema
import os from "os";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Métricas del sistema operativo
    const systemMetrics = {
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024), // MB
        free: Math.round(os.freemem() / 1024 / 1024), // MB
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024), // MB
        usage: Math.round(
          ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        ), // %
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
        usage: Math.round(Math.random() * 50 + 10), // Simulado
      },
      uptime: os.uptime(),
      platform: os.platform(),
      version: process.version,
    };

    // Métricas de Node.js
    const nodeMetrics = {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
      external: Math.round(process.memoryUsage().external / 1024 / 1024), // MB
      pid: process.pid,
      uptime: process.uptime(),
    };

    return NextResponse.json({
      success: true,
      system: systemMetrics,
      node: nodeMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting system metrics:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener métricas del sistema" },
      { status: 500 }
    );
  }
}
