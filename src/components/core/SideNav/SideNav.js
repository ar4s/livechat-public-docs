import React, { useState, Fragment, useContext } from "react";
import {
  Nav,
  NavHeader,
  MenuWrapper,
  Ul,
  CollapsableSection,
  MenuElement,
} from "../components";
import { Search } from "../Search";
import { HomeIcon, ChevronRight } from "../icons";
import {
  useAllArticlesInCategory,
  useCategoryMeta,
  useAllCategoriesMeta,
  useScrollSpy,
} from "../../../hooks";
import { Link } from "gatsby";
import { PopperTooltip } from "@livechat/design-system";
import { VersionContext } from "../../../contexts";
import { getVersionColor } from "../../../utils";

const printItems = (items, toggleState, activeUrls, depth = 0) => {
  return (
    <Ul>
      {items.map(({ title, path, url, items: itemsInside, isSubcategory }) => {
        const isActiveItem =
          (activeUrls &&
            url === activeUrls[activeUrls.length - 1] &&
            !isSubcategory) ||
          "";

        const isActiveSection =
          activeUrls &&
          activeUrls.includes(url) &&
          url.includes(activeUrls[depth]);

        let redirectUrl = url || "#";
        return (
          <Fragment key={`toc-${depth}-${url}`}>
            <MenuElement
              url={redirectUrl}
              title={title}
              active={isActiveItem}
              onClick={toggleState(path)}
            />
            {itemsInside && (
              <CollapsableSection expanded={isActiveSection}>
                {printItems(itemsInside, toggleState, activeUrls, depth + 1)}
              </CollapsableSection>
            )}
          </Fragment>
        );
      })}
    </Ul>
  );
};

const getCategoryTitle = (menuItems, category) => {
  const pathname = window.location.pathname;

  const iterate = (obj) => {
    if (obj.url === pathname) {
      return obj.title;
    }
    if (obj.items && obj.items.length > 0) {
      obj.items.forEach((item) => {
        iterate(item);
      });
    }
    return "";
  };
  let a;
  menuItems.forEach((item) => {
    const c = iterate(item);
    if (c !== "") {
      a = c;
    }
  });
  console.log(a);

  /*const iterate = (obj) => {
    Object.keys(obj).forEach((key) => {
      console.log(`key: ${key}, value: ${obj[key]}`);

      if (typeof obj[key] === "object") {
        iterate(obj[key]);
      }
    });
  };

  console.log(iterate(menuItems[0]));*/
};

const SideNav = ({
  category,
  subcategory,
  currentSlug,
  expanded,
  setExpanded,
}) => {
  const { items: versions, selected: selectedVersion } = useContext(
    VersionContext
  );
  const [articles, getArticlePath] = useAllArticlesInCategory(
    category,
    currentSlug,
    selectedVersion
  );

  const categories = useAllCategoriesMeta().map((item) => ({
    ...item,
    url: `/${item.slug}/`,
    items: null,
  }));

  const menuItems = category ? articles : categories;

  const initialPath = subcategory
    ? [`/${category}/${subcategory}/`, currentSlug]
    : [currentSlug];

  const [activePath, setActivePath] = useState(initialPath);
  const toggleState = (path) => () => setActivePath(path);

  const categoryMeta = useCategoryMeta(category);

  getCategoryTitle(menuItems, category);

  useScrollSpy(".heading", (url) => url && setActivePath(getArticlePath(url)));

  const navColor = getVersionColor(selectedVersion, versions);

  return (
    <Nav color={navColor} expanded={expanded} setExpanded={setExpanded}>
      <NavHeader>
        <Link to={"/"} style={{ color: "inherit" }}>
          <PopperTooltip
            isVisible={true}
            placement={"bottom-start"}
            triggerActionType={"hover"}
            trigger={
              <span>
                <HomeIcon width={18} style={{ display: "block" }} />
              </span>
            }
            closeOnOutsideClick
            zIndex={2}
          >
            {"Home"}
          </PopperTooltip>
        </Link>
        <ChevronRight width={14} />
        <span style={{ marginBottom: "-3px" }}>
          {categoryMeta.title || "Home"}
        </span>
      </NavHeader>
      <NavHeader>
        <Search />
      </NavHeader>
      <MenuWrapper>
        {printItems(menuItems, toggleState, activePath, undefined)}
      </MenuWrapper>
    </Nav>
  );
};

export default SideNav;
