// app/api/invoices/route.js

let invoices = [];
let nextId = 1;

// Get all invoices
export async function GET() {
  return Response.json(invoices);
}

// Create invoice
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, amount, dueDate } = body;

    if (!customerName || !amount || !dueDate) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400 }
      );
    }

    const newInvoice = {
      id: nextId++,
      customerName: String(customerName),
      amount: Number(amount),
      dueDate: String(dueDate),
      createdAt: new Date().toISOString(),
    };

    invoices.push(newInvoice);

    return new Response(JSON.stringify(newInvoice), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return new Response(
      JSON.stringify({ message: "Error while creating the invoice." }),
      { status: 500 }
    );
  }
}

// Update invoice
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, customerName, amount, dueDate } = body;

    if (!id || !customerName || !amount || !dueDate) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400 }
      );
    }

    const index = invoices.findIndex((inv) => inv.id === Number(id));
    if (index === -1) {
      return new Response(
        JSON.stringify({ message: "Invoice not found." }),
        { status: 404 }
      );
    }

    invoices[index] = {
      ...invoices[index],
      customerName: String(customerName),
      amount: Number(amount),
      dueDate: String(dueDate),
    };

    return new Response(JSON.stringify(invoices[index]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return new Response(
      JSON.stringify({ message: "Error while updating the invoice." }),
      { status: 500 }
    );
  }
}

// Delete invoice
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ message: "Invoice id is required." }),
        { status: 400 }
      );
    }

    const index = invoices.findIndex((inv) => inv.id === Number(id));
    if (index === -1) {
      return new Response(
        JSON.stringify({ message: "Invoice not found." }),
        { status: 404 }
      );
    }

    const deleted = invoices[index];
    invoices.splice(index, 1);

    return new Response(JSON.stringify(deleted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return new Response(
      JSON.stringify({ message: "Error while deleting the invoice." }),
      { status: 500 }
    );
  }
}