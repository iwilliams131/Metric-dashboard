async function loadData() {
  const res = await fetch('data/data.json');
  return await res.json();
}

function aggregateMonthly(data) {
  const buckets = {};

  data.forEach(row => {
    const d = new Date(row.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}`;
    if (!buckets[monthKey]) buckets[monthKey] = { revenue: 0, orders: 0 };

    buckets[monthKey].revenue += row.revenue;
    buckets[monthKey].orders += row.orders;
  });

  const months = Object.keys(buckets).sort();

  return months.map(m => ({
    month: m,
    revenue: buckets[m].revenue,
    orders: buckets[m].orders
  }));
}

async function render() {
  const rows = await loadData();
  const monthly = aggregateMonthly(rows);

  const labels = monthly.map(x => x.month);
  const revenueData = monthly.map(x => x.revenue);
  const ordersData = monthly.map(x => x.orders);

  // Update KPIs
  const totalRev = revenueData.reduce((a,b)=>a+b,0);
  const totalOrders = ordersData.reduce((a,b)=>a+b,0);
  const avgOrder = totalRev / totalOrders;

  document.getElementById("kpi-revenue").innerText = `$${totalRev.toLocaleString()}`;
  document.getElementById("kpi-orders").innerText = totalOrders.toLocaleString();
  document.getElementById("kpi-aov").innerText = `$${avgOrder.toFixed(2)}`;

  // Revenue Chart
  new Chart(document.getElementById("revenueChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue ($)",
        data: revenueData,
        borderWidth: 2,
        tension: 0.3
      }]
    },
  });

  // Orders Chart
  new Chart(document.getElementById("ordersChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Orders",
        data: ordersData,
        borderWidth: 1
      }]
    }
  });
}

render();
