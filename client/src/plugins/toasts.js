import "mosha-vue-toastify/dist/style.css";
import { createToast } from "mosha-vue-toastify";

export default {
  install(app) {
    app.config.globalProperties.$error = (description, title) =>
      createToast(
        {
          title,
          description,
        },
        {
          hideProgressBar: true,
          showIcon: true,
          position: "bottom-right",
          type: "danger",
          timeout: 4000,
          showCloseButton: false,
        }
      );
    app.config.globalProperties.$info = (description, title) =>
      createToast(
        {
          title,
          description,
        },
        {
          hideProgressBar: true,
          showIcon: true,
          position: "bottom-right",
          type: "success",
          timeout: 4000,
          showCloseButton: false,
        }
      );
    app.config.globalProperties.$transactionInfo = (title, transaction) =>
      app.config.globalProperties.$info(
        "Check transaction on <a target='_blank' href='https://koinosblocks.com/tx/" +
          transaction.id +
          "' style='color:white'>Koinos blocks</a>",
        title
      );

    app.config.globalProperties.$warning = (description, title) =>
      createToast(
        { title, description },
        {
          hideProgressBar: true,
          showIcon: true,
          position: "bottom-right",
          type: "warning",
          timeout: 7000,
          showCloseButton: false,
        }
      );
  },
};
