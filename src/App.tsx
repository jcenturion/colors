import * as React from "react";
import * as _ from "lodash";
import "./App.css";
import Axios from "axios";

import {
  PageLayout,
  ColumnLayout,
  Heading,
  RowLayout,
  Form,
  Select,
  AvatarBlock,
  GalleryLayout,
  Spinner
} from "@auth0/cosmos";
import styled from "@auth0/cosmos/styled";

const Container = styled.div`
  text-align: center;
  width: 100%;
  height: 100px;
  border-radius: 3px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
`;

const SpinnerContainer = styled.div`
  height: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type CompanyBrand = {
  domain: string;
  logo: string;
  name: string;
  primaryColor: string;
};

type BrandColor = {
  hex: string;
  hsl?: number[];
  rgb?: number[];
  population?: number;
};

type BrandColors = {
  vibrant: BrandColor;
  darkVibrant: BrandColor;
  lightVibrant: BrandColor;
  muted: BrandColor;
  darkMuted: BrandColor;
  lightMuted: BrandColor;
};

class App extends React.Component<any, any> {
  public state = {
    working: false,
    selectedCompany: "",
    palette: {
      vibrant: {
        hex: "#F9F9F9"
      },
      darkMuted: {
        hex: "#F9F9F9"
      },
      darkVibrant: {
        hex: "#F9F9F9"
      },
      lightMuted: {
        hex: "#F9F9F9"
      },
      lightVibrant: {
        hex: "#F9F9F9"
      },
      muted: {
        hex: "#F9F9F9"
      }
    }
  };
  public searchCompany: (searchTerm: string, callback: any) => void;

  constructor(props: any) {
    super(props);
    this.searchCompany = _.debounce(this.search, 250, { leading: true, trailing: true });
  }

  public onCompanyChange = async (e: any) => {
    const selectedCompany = e.target.value;
    let palette = this.state.palette;

    this.setState({ working: true });

    // When the users clears the dropdown
    if (_.isNull(selectedCompany)) {
      return;
    }

    const company: CompanyBrand = selectedCompany.value;

    try {
      palette = await this.getPrimaryColor(company.logo);
    } catch (e) {
      //
    }

    this.setState({
      selectedCompany,
      palette,
      working: false
    });
  };

  public async getPrimaryColor(logoUrl: string): Promise<BrandColors> {
    return this.resolveBrandColors(logoUrl);
  }

  public async resolveBrandColors(logoUrl: string): Promise<BrandColors> {
    const result = await Axios.create()
      .post(`https://wt-centurion_javier-gmail_com-0.sandbox.auth0-extend.com/colors`, {
        logoUrl
      })
      .then((res) => res.data);
    return result as BrandColors;
  }

  public async _searchCompany(searchTerm: string): Promise<CompanyBrand[]> {
    const result = await Axios.create()
      .get<CompanyBrand[]>(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${searchTerm}`)
      .then((res) => res.data);
    return result as CompanyBrand[];
  }

  public search = (searchTerm: any, callback: any) => {
    this._searchCompany(searchTerm).then((matches) => {
      matches = _.sortBy(matches, ["name"]);

      const options = _.map(matches, (match: any, idx: number) => ({
        label: match.name,
        description: match.domain,
        value: match
      }));

      callback(options);
    });
  };

  public getCorrectTextColor(hex: string) {
    const threshold = 130;

    const hRed = hexToR(hex);
    const hGreen = hexToG(hex);
    const hBlue = hexToB(hex);

    function hexToR(h) {
      return parseInt(cutHex(h).substring(0, 2), 16);
    }
    function hexToG(h) {
      return parseInt(cutHex(h).substring(2, 4), 16);
    }
    function hexToB(h) {
      return parseInt(cutHex(h).substring(4, 6), 16);
    }
    function cutHex(h) {
      return h.charAt(0) === "#" ? h.substring(1, 7) : h;
    }

    const cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;
    if (cBrightness > threshold) {
      return "#000000";
    } else {
      return "#ffffff";
    }
  }

  public render() {
    return (
      <ColumnLayout gutter="medium" distribution="1/4 2/4 1/4">
        <div />
        <RowLayout gutter="medium">
          <div />
          <PageLayout>
            <PageLayout.Header>
              <Heading size={1}>Colors</Heading>
            </PageLayout.Header>
            <PageLayout.Content>
              <RowLayout>
                <Form layout="label-on-top">
                  <Form.Field label="Company Name">
                    <Select
                      async={true}
                      value={this.state.selectedCompany}
                      onChange={this.onCompanyChange}
                      placeholder="Enter your company name"
                      noOptionsMessage={({ inputValue }) =>
                        inputValue.length > 0 ? "No company found" : "Type to search..."
                      }
                      loadOptions={this.searchCompany}
                      customOptionRenderer={({ value }: { value: CompanyBrand }) => {
                        return <AvatarBlock type="user" size="default" image={value.logo} title={value.name} />;
                      }}
                    />
                  </Form.Field>
                </Form>

                {this.state.working ? (
                  <SpinnerContainer>
                    <Spinner size="medium" />
                  </SpinnerContainer>
                ) : (
                  <GalleryLayout gutter="medium" size="medium">
                    <Container
                      color={this.getCorrectTextColor(this.state.palette.vibrant.hex)}
                      backgroundColor={this.state.palette.vibrant.hex}
                    >
                      <RowLayout gutter="none">
                        {this.state.palette.vibrant.hex.toUpperCase()}
                        Vibrant
                      </RowLayout>
                    </Container>
                    <Container
                      color={this.getCorrectTextColor(this.state.palette.muted.hex)}
                      backgroundColor={this.state.palette.muted.hex}
                    >
                      <RowLayout gutter="none">
                        {this.state.palette.muted.hex.toUpperCase()}
                        Muted
                      </RowLayout>
                    </Container>
                    <Container
                      color={this.getCorrectTextColor(this.state.palette.lightMuted.hex)}
                      backgroundColor={this.state.palette.lightMuted.hex}
                    >
                      <RowLayout gutter="none">
                        {this.state.palette.lightMuted.hex.toUpperCase()}
                        Light Muted
                      </RowLayout>
                    </Container>
                    <Container
                      color={this.getCorrectTextColor(this.state.palette.lightVibrant.hex)}
                      backgroundColor={this.state.palette.lightVibrant.hex}
                    >
                      <RowLayout gutter="none">
                        {this.state.palette.lightVibrant.hex.toUpperCase()}
                        Light Vibrant
                      </RowLayout>
                    </Container>
                    <Container
                      color={this.getCorrectTextColor(this.state.palette.darkMuted.hex)}
                      backgroundColor={this.state.palette.darkMuted.hex}
                    >
                      <RowLayout gutter="none">
                        {this.state.palette.darkMuted.hex.toUpperCase()}
                        Dark Muted
                      </RowLayout>
                    </Container>
                    <Container
                      color={this.getCorrectTextColor(this.state.palette.darkVibrant.hex)}
                      backgroundColor={this.state.palette.darkVibrant.hex}
                    >
                      <RowLayout gutter="none">
                        {this.state.palette.darkVibrant.hex.toUpperCase()}
                        Dark Vibrant
                      </RowLayout>
                    </Container>
                  </GalleryLayout>
                )}
              </RowLayout>
            </PageLayout.Content>
          </PageLayout>
        </RowLayout>
        <div />
      </ColumnLayout>
    );
  }
}

export default App;
