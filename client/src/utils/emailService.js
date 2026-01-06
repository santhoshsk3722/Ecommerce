import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendOrderConfirmation = async (orderId, user, items, total, address) => {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn("EmailJS keys missing. Skipping email.");
        return;
    }

    // Prepare template params
    // Your EmailJS template should use variables like {{user_name}}, {{order_id}}, {{total}}, etc.
    const templateParams = {
        to_name: user.name,
        to_email: user.email,
        order_id: orderId,
        total_amount: `$${total.toFixed(2)}`,
        shipping_address: address,
        order_items: items.map(item => `${item.title} (x${item.quantity})`).join(', '),
        date: new Date().toLocaleDateString()
    };

    try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('Email sent successfully!', response.status, response.text);
        return true;
    } catch (err) {
        console.error('Failed to send email:', err);
        return false;
    }
};
