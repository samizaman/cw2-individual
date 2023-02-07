var vueInstance = new Vue({
  el: "#app",
  data: () => {
    return {
      lessons: [],
      cart: [], // array to store items in shopping cart
      showLesson: true,
      sortBy: "",
      sortDirection: "",
      searchInput: "",
      phoneNumber: "",
      isValid: false,
      name: "",
      test: [],
    };
  },
  created: function () {
    console.log("Requesting data from server...");

    fetch('collection/lessons')
      .then(response => response.json())
      .then(lessons => {
        this.lessons = lessons
        console.log("Data received from server: ", lessons);

      })
      .catch(error => {
        console.error(error)
      })

  },
  methods: {
    searchLessons() {
      fetch('collection/lessons/' + this.searchInput)
        .then(response => response.json())
        .then(lessons => {
          this.lessons = lessons
          console.log("Data received from server: ", lessons);

        })
        .catch(error => {
          console.log("---------------------------------------");
          console.error(error)
        })
    },
    // pushes lesson to the cart array and subtracts one space
    addToCart(lesson) {

      let existingLesson = this.cart.find(item => item._id === lesson._id);
      if (existingLesson) {
        existingLesson.quantity += 1;
        existingLesson.space -= 1;
        existingLesson.price += lesson.price;
      } else {
        let selectedLesson = this.lessons.find(item => item._id === lesson._id);
        selectedLesson.space -= 1;
        let newLesson = {
          _id: selectedLesson._id,
          price: lesson.price,
          quantity: 1,
          space: selectedLesson.space
        }
        this.cart.push(selectedLesson);
      }
      console.log("Added to cart: ", JSON.stringify(this.cart));
    },

    // if showCheckout returns true it shows the lessons if its false it shows checkout
    showCheckout() {
      this.showLesson = !this.showLesson && this.cart.length > 0;
    },

    // Submits the form and resets to fresh homepage
    submitForm() {
      // alert("Order Submitted");
      let data = {
        name: this.name,
        phone: this.phoneNumber,
        lessons: []
      };

      this.cart.forEach(item => {
        let lesson = {
          lesson_id: item._id,
          quantity: item.quantity,
          space: item.space
        };
        data.lessons.push(lesson);
      });

      fetch('collection/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to submit order, please try again later');
          }
          return res.json();
        })
        .then(res => {
          if (res.success) {
            alert('Order submitted successfully');
          } else {
            alert('Something went wrong');
          }
        })
        .catch(error => {
          console.error(error);
          alert(error.message);
        });

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
            if (!res.ok) {
              throw new Error('Failed to update spaces, please try again later');
            }
            return res.json();
          })
          .then(res => {
            console.log(res);
          })
          .catch(error => {
            console.error(error);
            alert(error.message);
          });
      });

      this.cart = [];
      this.showLesson = true;
      this.sortBy = "";
      this.sortDirection = "";
      this.searchInput = "";
    },
    // removes one lesson from the cart array and adds one space
    removeFromCart(lesson) {
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
    // checks whether we are able to add items to the cart based on what's there in our available inventory 
    canAddToCart(lesson) {
      return lesson.space > 0;
    },
  },
  computed: {
    validateCart() {
      return this.cart.length > 0;
    },
    validateCheckout() {
      const letterRegex = /^[A-Za-z\s]*$/;
      const numberRegex = /^\d{10}$/;

      return this.name.match(letterRegex) && this.phoneNumber.match(numberRegex);
    },

    cartItemCount: function () {
      let totalQuantity = 0;
      this.cart.forEach(item => totalQuantity += item.quantity);
      console.log(totalQuantity + " items in cart");
      return totalQuantity || "";
    },

    searchAndSortLessons() {
      // If search input is present, send a GET request with the search input as a parameter
    //   if (this.searchInput) {
    //     fetch(`collection/lessons/${this.searchInput}`)
    //       .then(res => {
    //         if (!res.ok) {
    //           throw new Error('Failed to fetch search results, please try again later');
    //         }
    //         return res.json();
    //       })
    //       .then(searchResults => {
    //         this.lessons = searchResults;
    //       })
    //       .catch(error => {
    //         console.error(error);
    //         alert(error.message);
    //       });
    //   }
      // localeCompare() method compares two strings in the current locale
      // returns sort order -1, 1, or 0 (for before, after, or equal).
      // Map sorting functions based on sortBy and sortDirection
      const sortFunctions = {
        topic: {
          ascending: (a, b) => a.topic.localeCompare(b.topic),
          descending: (a, b) => b.topic.localeCompare(a.topic),
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

      const sortFunction = sortFunctions[this.sortBy]?.[this.sortDirection];

      // If sort function exists, sort lessons
      if (sortFunction) {
        return this.lessons.sort(sortFunction);
      }

      // If sortBy and sortDirection are not specified, return original lessons
      return this.lessons;
    },
  },
});