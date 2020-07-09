import React, { Component } from "react";
import axios from "axios";
import InputContainer from "./common/Input";
import ImageContainer from "./common/Image";

class App extends Component {
  state = {
    leaveFrom: "",
    searchData: [],
    activeOption: "",
    showOptions: false,
    orignalData: []
  };

  // Handle Change and hit api conditionly
  handleTravelApi = event => {
    this.setState(
      {
        [event.target.name]: event.target.value
      },
      () => {
        const { leaveFrom } = this.state;
        if (leaveFrom.length === 3) {
          axios
            .get(
              `https://autocomplete.travelpayouts.com/jravia?locale=en&with_countries=false&q=${leaveFrom.toUpperCase()}`
            )
            .then(response => {
              if (response.status === 200) {
                // Handle data according to country code, type: city || airport
                let modifiedData = [];
                let actualData = [];
                let count = 0;
                response.data.length &&
                  response.data.map((data, index) => {
                    actualData = [...actualData, { ...data }];
                    if (data._type === "city") {
                      modifiedData = [
                        ...modifiedData,
                        { ...data, children: [] }
                      ];
                    }

                    if (data._type === "airport") {
                      let objIndex = modifiedData.findIndex(
                        r => r.country_code === data.country_code
                      );
                      let findData = modifiedData.find(
                        r => r.country_code === data.country_code
                      );

                      if (objIndex !== -1 && findData._type === "city") {
                        modifiedData.splice(objIndex, 1, {
                          ...findData,
                          children: [...findData.children, { ...data }]
                        });
                      } else {
                        modifiedData = [
                          ...modifiedData,
                          { ...data, children: [] }
                        ];
                      }
                    }
                    return "";
                  });
                this.setState({
                  searchData: modifiedData,
                  orignalData: actualData
                });
              }
            })
            .catch(function(error) {
              // handle error
              console.log("error");
            });
        } else {
          this.setState({ searchData: [] });
        }
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
                            data.children.length
                              ? "/hotel-1.svg"
                              : "travels-1.svg"
                          }
                          alt="country"
                        />
                      </div>
                      <div className="airport-menu-text">
                        <span className="airport_name">
                          {data._type === "city"
                            ? data.city_fullname
                            : data.name}
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
