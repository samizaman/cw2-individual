var vueInstance = new Vue({
  el: "#app",
  data: {
      lessons: [],
      cart: [],
      showLesson: true,
      sortBy: "",
      sortDirection: "",
      searchInput: "",
      phoneNumber: "",
      isValid: false,
      name: "",
    },
  created: function () {
    console.log("Requesting data from server...");
    this.fetchData('collection/lessons');

  },
  methods: {
    fetchData(url) {
      // Fetch API used to make a GET request to the server
      fetch(url)
        // Parse the response as JSON data
        .then(response => response.json())
        .then(data => {
          // Set the lessons property in the Vue instance to the data received from the server
          this.lessons = data
          console.log("Data received from server: ", data);
        })
        .catch(error => {
          console.error(error)
        })
    },
    searchLessons() {
      this.fetchData('http://localhost:3000/collection/lessons/' + this.searchInput);
    },
    
    // Function to add a lesson to the cart
    addToCart(lesson) {
      // Check if the lesson already exists in the cart
      let existingLesson = this.cart.find(item => item._id === lesson._id);

      // If the lesson already exists in the cart
      if (existingLesson) {
        existingLesson.quantity += 1;
        existingLesson.space -= 1;
        existingLesson.price += lesson.price;
      } 
      // If the lesson does not exist in the cart
      else {
        lesson.space -= 1;
        this.cart.push(lesson);
      }
      // Log the updated cart to the console
      console.log("Added to cart: ", JSON.stringify(this.cart));
    },

    // if showCheckout returns true it shows the lessons if its false it shows checkout
    showCheckout() {
      this.showLesson = !this.showLesson && this.cart.length > 0;
    },

    // Function to submit and process the form data for ordering lessons
    submitAndProcessOrder() {
      // Form data to be sent to the server
      let data = {
        name: this.name,
        phone: this.phoneNumber,
        lessons: []
      };

      // Loop through the items in the cart and create a lesson object for each item
      this.cart.forEach(item => {
        let lesson = {
          lesson_id: item._id,
          quantity: item.quantity,
          space: item.space
        };
        data.lessons.push(lesson);
      });

      // Send a POST request to the server with the form data
      fetch('collection/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(res => {
          // If the response is not okay, throw an error
          if (!res.ok) {
            throw new Error('Failed to submit order, please try again later');
          }
          // Return the response in JSON format
          return res.json();
        })
        .then(res => {
          // If the order was submitted successfully, show a success message
          if (res.success) {
            alert('Order submitted successfully');
          } else {
            alert('Something went wrong');
          }
        })
        .catch(error => {
          // Log the error in the console and show an error message
          console.error(error);
          alert(error.message);
        });

      // Loop through the items in the cart and send a PUT request to update the spaces
      this.cart.forEach(item => {
        fetch(`collection/lessons/${item._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            space: item.space
          })
        })
          .then(res => {
            // If the response is not okay, throw an error
            if (!res.ok) {
              throw new Error('Failed to update spaces, please try again later');
            }
            // Return the response in JSON format
            return res.json();
          })
          .then(res => {
            console.log(res);
          })
          .catch(error => {
            // Log the error in the console and show an error message
            console.error(error);
            alert(error.message);
          });
      });

      // Reset the form fields and cart
      this.cart = [];
      this.showLesson = true;
      this.sortBy = "";
      this.sortDirection = "";
      this.searchInput = "";
    },
    /**
     * Removes one lesson from the cart array and adds one space to the original lesson
     * @param {Object} lesson - The lesson to be removed from the cart
     */
    removeLessonFromCart(lesson) {
      const index = this.cart.indexOf(lesson);
      if (index >= 0) {
        this.cart.splice(index, 1);
      }
      this.lessons.forEach((item) => {
        if (item._id === lesson._id) {
          item.space += 1;
        }
      });
      console.log(this.cart.length);
    },
  },
  computed: {
    validateCart() {
      return this.cart.length > 0;
    },
    /**
     * Validates the name and phone number inputs for checkout
     * @returns {Boolean} - Returns true if both name and phone number inputs match the validation criteria
     */
    validateCheckoutInputs() {
      const letterRegex = /^[A-Za-z\s]*$/;
      const numberRegex = /^\d{10}$/;

      return this.name.match(letterRegex) && this.phoneNumber.match(numberRegex);
    },
    /**
     * Calculates the total quantity of items in the cart
     * @returns {Number} - Returns the total quantity of items in the cart
     */
    getTotalCartItemCount() {
      let totalQuantity = 0;
      this.cart.forEach(item => totalQuantity += item.quantity);
      console.log(totalQuantity + " items in cart");
      return totalQuantity || "";
    },
    // Sort lessons based on specified sortBy and sortDirection
    sortLessons() {
      const sortFunctions = {
        subject: {
          ascending: (a, b) => a.subject.localeCompare(b.subject),
          descending: (a, b) => b.subject.localeCompare(a.subject),
        },
        price: {
          ascending: (a, b) => a.price - b.price,
          descending: (a, b) => b.price - a.price,
        },
        location: {
          ascending: (a, b) => a.location.localeCompare(b.location),
          descending: (a, b) => b.location.localeCompare(a.location),
        },
        availability: {
          ascending: (a, b) => a.space - b.space,
          descending: (a, b) => b.space - a.space,
        },
      };
      // Check if sort function exists based on sortBy and sortDirection
      const sortFunction = sortFunctions[this.sortBy]?.[this.sortDirection];

      // If sort function exists, sort lessons and return sorted lessons
      if (sortFunction) {
        return this.lessons.sort(sortFunction);
      }

      // If sortBy and sortDirection are not specified, return original lessons
      return this.lessons;
    },
  },
});