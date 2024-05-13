
//! Dahboard Chart Updations >>

function updatePieChart(orderStatusData, categoryData, perDay) {
    const xValues = orderStatusData.map(item => item._id);
    const yValues = orderStatusData.map(item => item.count);
    const barColors = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b", "#858796"];

    new Chart("myChart", {
        type: "doughnut",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors.slice(0, xValues.length),
                data: yValues
            }]
        },
        options: {
            responsive: true,
            title: {
              display: true,
              text: 'Order Status', 
              fontSize: 15,
              fontColor: '#111', 
              fontStyle: 'bold',
              position: 'top'
            },
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });

    // chart 2
    const XV = categoryData.map(item => item._id);
    const YV = categoryData.map(item => item.count);
    const CL = ["red", "green", "blue", "orange", "yellow", "brown"];

    new Chart("categoryChart", {
        type: "bar",
        data: {
            labels: XV,
            datasets: [{
                backgroundColor: CL.slice(0, XV.length),
                data: YV
            }]
        },
        options: {
            responsive: true,
            title: {
              display: true,
              text: 'category wise Orders', 
              fontSize: 15,
              fontColor: '#111', 
              fontStyle: 'bold',
              position: 'top'
            },
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });

    // chart 3

    const Dates = perDay.map(item => {
      const date = new Date(item._id); 
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: '2-digit' });
    });
    const count = perDay.map(item => item.count);
    const colour = ["red", "green", "blue", "orange", "yellow", "brown"];

    new Chart("perDayChart", {
      type: "line",
      data: {
        labels: Dates,
        datasets: [{
          data: count,
          borderColor: "red",
          fill: false
        }]
      },
      options: {
        legend: {display: false},
        title: {
          display: true,
          text: 'Daily Order Counts', 
          fontSize: 15,
          fontColor: '#111', 
          fontStyle: 'bold',
          // padding: 20,
          position: 'top'
        }
      }
    });
  }



//! top selling table show >>>

function showTable(tableType) {
    document.getElementById('categoryTable').style.display = 'none';
    document.getElementById('productTable').style.display = 'none';
    document.getElementById('brandTable').style.display = 'none';
    
    if (tableType === 'category') {
      document.getElementById('categoryTable').style.display = '';
    } else if (tableType === 'product') {
      document.getElementById('productTable').style.display = '';
    } else if (tableType === 'brand') {
      document.getElementById('brandTable').style.display = '';
    }
  }
  


//! Update Sales Table >>

function updateSalesTable(salesReport) {
    const tbody = document.querySelector('.cart-table tbody');
    tbody.innerHTML = ''; 
    salesReport.forEach(report => {
      const row = `
        <tr class="table-body-row">
          <td data-label="Order Id">${report._id}</td>
          <td data-label="Order Date">${new Date(report.orderDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td data-label="User Name">${report.address.Name}</td>
          <td data-label="Address">${report.address.address}, ${report.address.Locality}, ${report.address.city}, ${report.address.state}, PIN:${report.address.PIN}</td>
          <td data-label="Phone">${report.address.Mobile}</td>
          <td data-label="Product Name">${report.orderItems.map(item => `<p>${item.productName},</p>`).join('')}</td>
          <td data-label="Category">${report.orderItems.map(item => `<p>${item.category},</p>`).join('')}</td>
          <td data-label="Status">${report.orderStatus}</td>
          <td data-label="Total Amount">₹${report.totalAmount}</td>
        </tr>
      `;
      tbody.innerHTML += row; 
    });
  }


  // pdf
  function downloadPDF(divId) {
    const element = document.getElementById(divId); 

    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
            orientation: 'portrait',
        });
        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('download.pdf');
    });
}



    //! validate date 

    function validDate(event) {
      event.preventDefault(); 

      var startDate = document.getElementById('start-date').value;
      var endDate = document.getElementById('end-date').value;
      var currentDate = new Date().toISOString().split('T')[0]; 

      var errorMessage = '';
      if (startDate > currentDate || endDate > currentDate) {
          errorMessage = 'Dates cannot be in the future.';
      } else if (startDate > endDate) {
          errorMessage = 'Start date cannot be later than end date.';
      }

      if (errorMessage) {
          document.getElementById('error-message').style.display = 'block';
          document.getElementById('error-message').textContent = errorMessage;
          return false
      } else {
          document.getElementById('error-message').style.display = 'none';
          return true
      }
              
    }