import React, { Component } from "react";
import axios from "axios";
import InputContainer from "./common/Input";
import ImageContainer from "./common/Image";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leaveFrom: "",
      searchData: [],
      activeOption: "",
      showOptions: false,
      orignalData: []
    };
    this.deBouncing = null;
  }

  // Handle Search api
  _handleSearch = () => {
    const { leaveFrom } = this.state;
    axios
      .get(
        `https://autocomplete.travelpayouts.com/jravia?locale=en&with_countries=false&q=${leaveFrom}`
      )
      .then(response => {
        if (response.status === 200) {
          // Handle data according to country code, type: city || airport
          let cityData = [];
          let actualData = [];
          let airportData = {};
          response.data.length &&
            response.data.map((data, index) => {
              actualData = [...actualData, { ...data }];

              // Handle if object is city
              if (data._type === "city") {
                if (data._type in airportData) {
                  cityData = [
                    ...cityData,
                    { ...data, children: [airportData[data._type]] }
                  ];
                } else {
                  cityData = [...cityData, { ...data, children: [] }];
                }
              }

              // Handle if object is airport
              if (data._type === "airport") {
                let cityIndex = cityData.findIndex(
                  r => r.city_code === data.city_code
                );

                // Checks whether exist or not in cityData, if is for not exist
                if (cityIndex === -1) {
                  // Checks if airport data is already exist for current object
                  if (airportData[data._type]) {
                    airportData[data._type] = [
                      ...airportData[data._type],
                      { ...data, findIndex: index }
                    ];
                  } else {
                    airportData[data.city_code] = [
                      { ...data, findIndex: index }
                    ];
                  }
                } else {
                  // If current object data is already exist in cityData
                  let newObj = {
                    ...cityData[cityIndex],
                    children: [
                      ...cityData[cityIndex].children,
                      { ...data, findIndex: index }
                    ]
                  };
                  cityData.splice(cityIndex, 1, {
                    ...newObj
                  });
                }
              }
            });

          // Maping airport data whose city is not available
          if (Object.keys(airportData).length) {
            Object.keys(airportData).map(data => {
              let cityIndex = cityData.findIndex(r => r.city_code === data);
              if (cityIndex === -1) {
                cityData.splice(
                  airportData[data][0].findIndex,
                  0,
                  airportData[data][0]
                );
              } else {
                let newChildren = [
                  ...cityData[cityIndex].children,
                  { ...airportData[data][0] }
                ];

                newChildren.sort(
                  (a, b) => parseFloat(a.findIndex) - parseFloat(b.findIndex)
                );

                let newObj = {
                  ...cityData[cityIndex],
                  children: [...newChildren]
                };
                cityData.splice(cityIndex, 1, {
                  ...newObj
                });
              }
            });
          }

          this.setState({
            searchData: cityData,
            orignalData: actualData
          });
        }
      })
      .catch(function(error) {
        console.log("error");
      });
  };

  // Handle Change and hit api conditionly
  handleTravelApi = event => {
    this.setState(
      {
        [event.target.name]: event.target.value
      },
      () => {
        clearTimeout(this.deBouncing);
        this.deBouncing = setTimeout(() => {
          this._handleSearch();
        }, 300);
      }
    );
  };

  handleSelectValue = data => {
    this.setState({
      leaveFrom: data._type === "city" ? data.city_fullname : data.name,
      searchData: []
    });
  };

  renderItem = searchData => {
    const { activeOption } = this.state;
    let count = 0;
    return (
      <>
        {searchData.length
          ? searchData.map((data, index) => {
              count = index ? count + 1 : count;
              return (
                <>
                  <li
                    className={`menu-item ${
                      count === activeOption ? "active" : ""
                    }`}
                    key={data._id}
                    onClick={() => this.handleSelectValue(data)}
                  >
                    <a href="#" className={`airport-menu-item`}>
                      <div className="airport-menu-icon">
                        <ImageContainer
                          src={
                            data._type === "city"
                              ? "/hotel-1.svg"
                              : "travels-1.svg"
                          }
                          alt="country"
                        />
                      </div>
                      <div className="airport-menu-text">
                        <span className="airport_name">
                          {data.city_fullname}
                        </span>
                        <span className="airport-menu-country">
                          {data._type === "city" ? "All Airports" : data.code}
                        </span>
                      </div>
                    </a>
                  </li>
                  {data.children
                    ? data.children.map(val => {
                        count = count + 1;
                        return (
                          <li
                            className={`menu-item ${
                              count === activeOption ? "active" : ""
                            }`}
                            key={val._id}
                            onClick={() => this.handleSelectValue(val)}
                          >
                            <a
                              href="#"
                              className={`airport-menu-item child-item`}
                            >
                              <div className="airport-menu-icon">
                                <ImageContainer
                                  src="travels-1.svg"
                                  alt="airport"
                                />
                              </div>
                              <div className="airport-menu-text">
                                <span className="airport_name">{val.name}</span>
                                <span className="airport-menu-country">
                                  {val.code}
                                </span>
                              </div>
                            </a>
                          </li>
                        );
                      })
                    : ""}
                </>
              );
            })
          : ""}
      </>
    );
  };

  onKeyDown = e => {
    const { activeOption, orignalData, searchData } = this.state;

    if (e.keyCode === 9) {
      let newArray = [];
      searchData.map(data => {
        newArray = [...newArray, data];

        if (data.children) {
          data.children.map(val => {
            newArray = [...newArray, val];
          });
        }
      });
      let selectedData = newArray[activeOption];
      selectedData &&
        this.setState({
          activeOption: 0,
          leaveFrom:
            selectedData._type === "city"
              ? selectedData.city_fullname
              : selectedData.name,
          searchData: []
        });
      e.preventDefault();
    } else if (e.keyCode === 38) {
      if (activeOption === 0) {
        return;
      }
      this.setState({
        activeOption: activeOption !== "" ? activeOption - 1 : 0
      });
    } else if (e.keyCode === 40) {
      if (activeOption === orignalData.length - 1) {
        return;
      }
      this.setState({
        activeOption: activeOption !== "" ? activeOption + 1 : 0
      });
    }
  };

  render() {
    const { leaveFrom, searchData } = this.state;

    return (
      <div className="container mt-5">
        <div className="inputfield">
          <InputContainer
            id="input-field"
            type="text"
            name="leaveFrom"
            value={leaveFrom}
            className="input-field"
            placeholder="Search.."
            onKeyDown={this.onKeyDown}
            onChange={this.handleTravelApi}
          />
          <div className="form-icon">
            <ImageContainer src="location.png" alt="airport" width="25" />
          </div>
        </div>
        <ul className="autocomplete">{this.renderItem(searchData)}</ul>
      </div>
    );
  }
}

export default App;
